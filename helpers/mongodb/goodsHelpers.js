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
        generalHelpers.databaseUnwind("$unit"),
        { $match : {enable: true} }
    ]);
};

// Create good
module.exports.createGood = async ({name, weigh, color, height, chamber, description, creator}) => {
    // Data
    const enable = true;
    const created_by = creator;
    const created_at = new Date();

    // Keep into database
    const atomicGoodCreateData = await atomicGoodCreate({
        name, weigh, enable, description, color, height,
        created_by, created_at, chamber: new ObjectId(chamber)
    });
    if(!atomicGoodCreateData.status) {
        return atomicGoodCreateData;
    }

    // Push chamber good
    if(chamber) {
        const createdGoodId = atomicGoodCreateData.data;
        return await chambersHelpers.addChamberGoodByChamberId(chamber, createdGoodId);
    }

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
    const atomicGoodUpdateData = await atomicGoodUpdate(id, {
        $set: {name, color, weigh, height, description, chamber: new ObjectId(chamber)}
    });
    if(!atomicGoodUpdateData.status) {
        return atomicGoodUpdateData;
    }

    // Old and new chamber management
    const oldChamber = atomicGoodFetchData.data.chamber;
    if(oldChamber !== chamber) {
        // Remove old good chamber id different from new chamber
        if(oldChamber) {
            const removeChamberGoodByChamberIdData = await chambersHelpers.removeChamberGoodByChamberId(oldChamber, id);
            if(!removeChamberGoodByChamberIdData.status) {
                return removeChamberGoodByChamberIdData;
            }
        }
        // Add new good chamber id different from new chamber
        if(chamber) {
            const addChamberGoodByChamberIdData = await chambersHelpers.addChamberGoodByChamberId(chamber, id);
            if(!addChamberGoodByChamberIdData.status) {
                return addChamberGoodByChamberIdData;
            }
        }
    }

    return atomicGoodUpdateData;
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

// Add good picture by good id
module.exports.addGoodPictureByGoodId = async (id, picture) => {
    return await atomicGoodUpdate(id, {$push: {pictures: picture}});
};

// Remove good picture by good id
module.exports.removeGoodPictureByGoodId = async (id, pictureId) => {
    return await atomicGoodUpdate(id, {$pull: {pictures: {id: pictureId}}});
};

// Simple archive good
module.exports.simpleArchiveGoodByGoodId = async (id) => {
    // TODO: Implement archive procedures

    return await atomicGoodUpdate(id, {$set: {enable: false}});
}

// Archive good
module.exports.archiveGoodByGoodId = async (id) => {
    // TODO: Implement archive procedures

    // Data
    const _id = new ObjectId(id);

    // Fetch good
    const atomicGoodFetchData = await atomicGoodFetch({_id});
    if(!atomicGoodFetchData.status) {
        return atomicGoodFetchData;
    }

    // Remove chamber good
    const chamber = atomicGoodFetchData.data.chamber;
    if(chamber) {
        const removeChamberGoodByChamberIdData = await chambersHelpers.removeChamberGoodByChamberId(chamber, id);
        if(!removeChamberGoodByChamberIdData.status) {
            return removeChamberGoodByChamberIdData;
        }
    }

    return await atomicGoodUpdate(id, {$set: {enable: false, chamber: null}});
};

// Embedded goods fetch into database
const embeddedGoodsFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedGoodsFetchData = await client.db().collection(goodsCollection)
            .aggregate(directives)
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        embeddedGoodsFetchData.forEach(item => data.push(new GoodModel(item).simpleResponseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Embedded good fetch into database
const embeddedGoodFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedGoodFetchData = await client.db().collection(goodsCollection)
            .aggregate(directives)
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

// Atomic good fetch into database
const atomicGoodFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicGoodFetchData = await client.db().collection(goodsCollection).findOne(directives);
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
const atomicGoodCreate = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicGoodCreateData = await client.db().collection(goodsCollection).insertOne(directives);
        // Format response
        if(atomicGoodCreateData.acknowledged && atomicGoodCreateData.insertedId) {
            data = atomicGoodCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.GOODS.CREATE_GOOD;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic good update into database
const atomicGoodUpdate = async (id, directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        const _id = new ObjectId(id);
        // Query
        const atomicGoodUpdateData = await client.db().collection(goodsCollection).updateOne(
            {_id}, directives
        );
        // Format response
        if(atomicGoodUpdateData.matchedCount === 1 && atomicGoodUpdateData.modifiedCount === 0) {
            message = errorConstants.GENERAL.NO_CHANGES;
        }
        else if(atomicGoodUpdateData.modifiedCount === 1) status = true;
        else message = errorConstants.GOODS.GOOD_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
