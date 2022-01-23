const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const GoodModel = require('../../models/goodModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const generalConstants = require("../../constants/generalConstants");
const chambersHelpers = require("../../helpers/mongodb/chambersHelpers");

// Data
const goodsCollection = "goods";
const chambersCollection = "chambers";
const databaseUrl = envConstants.DATABASE_URL;
const goodChamberLookup = {
    $lookup: {
        from: chambersCollection,
        localField: "chamber",
        foreignField: "_id",
        as: "unit"
    }
};

// Fetch all goods with chamber into database
module.exports.goodsWithChamber = async () => {
    return await embeddedGoodsFetch([
        goodChamberLookup,
        generalHelpers.databaseUnwind("$unit")
    ]);
};

// Fetch good by id with chamber & creator into database
module.exports.goodByIdWithChamberAndCreator = async (id) => {
    // Data
    const _id = new ObjectId(id);

    // Database fetch
    return await embeddedGoodFetch([
        goodChamberLookup,
        generalHelpers.databaseUnwind("$unit"),
        generalConstants.LOOP_DIRECTIVE.CREATOR,
        generalHelpers.databaseUnwind("$creator"),
        { $match : {_id} }
    ]);
};

// Fetch all chamber goods into database
module.exports.chamberGoods = async (chamber) => {
    return await atomicGoodsFetch({chamber: new ObjectId(chamber)});
};

// Create good
module.exports.createGood = async ({name, weigh, color, height, chamber, description, creator}) => {
    // Data
    const updatable = true;
    const deletable = true;
    const created_by = creator;
    const created_at = new Date();

    // Keep into database
    const atomicGoodCreateData = await atomicGoodCreate({
        name, weigh, color, height,
        updatable, deletable, description,
        created_by, created_at, chamber: new ObjectId(chamber)
    });
    if(!atomicGoodCreateData.status) {
        return atomicGoodCreateData;
    }

    // Push chamber good
    const createdGoodId = atomicGoodCreateData.data;
    await chambersHelpers.addChamberGoodByChamberId(chamber, createdGoodId);

    return atomicGoodCreateData;
};

// Update good
module.exports.updateGood = async ({id, name, color, weigh, height, chamber, description}) => {
    // Data
    const _id = new ObjectId(id);

    // Fetch good
    const atomicGoodFetchData = await atomicGoodFetch({_id});
    if(!atomicGoodFetchData.status) {
        return atomicGoodFetchData;
    }

    // Update good info
    const atomicGoodUpdateData = await atomicGoodUpdate(
        {_id, updatable: true},
        {$set: {name, color, weigh, height, description, chamber: new ObjectId(chamber)}}
    );
    if(!atomicGoodUpdateData.status) {
        return atomicGoodUpdateData;
    }

    // Old and new chamber management
    const oldChamber = atomicGoodFetchData.data.chamber;
    if(oldChamber !== chamber) {
        // Remove old good chamber id different from new chamber
        await chambersHelpers.removeChamberGoodByChamberId(oldChamber, id);
        // Add new good chamber id different from new chamber
        await chambersHelpers.addChamberGoodByChamberId(chamber, id);
    }

    return atomicGoodUpdateData;
};

// Delete good
module.exports.deleteGoodByGoodId = async (id) => {
    // Data
    const _id = new ObjectId(id);

    // Fetch good
    const atomicGoodFetchData = await atomicGoodFetch({_id});
    if(!atomicGoodFetchData.status) {
        return atomicGoodFetchData;
    }

    // Delete good info
    const atomicGoodDeleteData = await atomicGoodDelete({_id: new ObjectId(id), deletable: true});
    if(!atomicGoodDeleteData.status) {
        return atomicGoodDeleteData;
    }

    // Old and new chamber management
    const oldChamber = atomicGoodFetchData.data.chamber;
    if(oldChamber) {
        // Remove old good chamber id different from new chamber
        await chambersHelpers.removeChamberGoodByChamberId(oldChamber, id);
    }

    return atomicGoodDeleteData;
};

// Add good picture by good id
module.exports.addGoodPictureByGoodId = async (id, picture) => {
    return await atomicGoodUpdate({_id: new ObjectId(id)}, {$push: {pictures: picture}});
};

// Remove good picture by good id
module.exports.removeGoodPictureByGoodId = async (id, pictureId) => {
    return await atomicGoodUpdate({_id: new ObjectId(id)}, {$pull: {pictures: {id: pictureId}}});
};

// Embedded goods fetch into database
const embeddedGoodsFetch = async (pipeline) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedGoodsFetchData = await client.db().collection(goodsCollection)
            .aggregate(pipeline)
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        embeddedGoodsFetchData.forEach(item => data.push(new GoodModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Embedded good fetch into database
const embeddedGoodFetch = async (pipeline) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedGoodFetchData = await client.db().collection(goodsCollection)
            .aggregate(pipeline)
            .toArray();
        // Format response
        if(embeddedGoodFetchData.length > 0) {
            status = true;
            data = new GoodModel(embeddedGoodFetchData[0]).responseFormat;
        }
        else message = errorConstants.GOODS.GOOD_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic goods fetch into database
const atomicGoodsFetch = async (filter) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicGoodsFetchData = await client.db().collection(goodsCollection)
            .find(filter || {})
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        atomicGoodsFetchData.forEach(item => data.push(new GoodModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic good fetch into database
const atomicGoodFetch = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicGoodFetchData = await client.db().collection(goodsCollection).findOne(filter);
        // Format response
        if(atomicGoodFetchData !== null) {
            status = true;
            data = new GoodModel(atomicGoodFetchData);
        }
        else message = errorConstants.GOODS.GOOD_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic good create into database
const atomicGoodCreate = async (document) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicGoodCreateData = await client.db().collection(goodsCollection).insertOne(document);
        // Format response
        if(atomicGoodCreateData.acknowledged) {
            data = atomicGoodCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.GOODS.GOOD_CREATE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic good update into database
const atomicGoodUpdate = async (filter, update) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicGoodUpdateData = await client.db().collection(goodsCollection).updateOne(filter, update);
        // Format response
        if(atomicGoodUpdateData.acknowledged) {
            if(atomicGoodUpdateData.modifiedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.GOODS.GOOD_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic good delete into database
const atomicGoodDelete = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicGoodDeleteData = await client.db().collection(goodsCollection).deleteOne(filter);
        // Format response
        if(atomicGoodDeleteData.acknowledged) {
            if(atomicGoodDeleteData.deletedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.GOODS.GOOD_DELETE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
