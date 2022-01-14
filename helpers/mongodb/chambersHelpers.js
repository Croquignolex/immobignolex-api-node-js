const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const ChamberModel = require('../../models/chamberModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const goodsHelpers = require("../../helpers/mongodb/goodsHelpers");
const generalConstants = require("../../constants/generalConstants");
const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");

// Data
const chambersCollection = "chambers";
const propertiesCollection = "properties";
const databaseUrl = envConstants.DATABASE_URL;
const chamberPropertyLookup = {
    $lookup: {
        from: propertiesCollection,
        localField: "property",
        foreignField: "_id",
        as: "building"
    }
};

// Fetch all chambers with property into database
module.exports.chambersWithProperty = async () => {
    return await embeddedChambersFetch([
        chamberPropertyLookup,
        generalHelpers.databaseUnwind("$building"),
        { $match : {deleted: false} }
    ]);
};

// Fetch chamber by id with property & creator into database
module.exports.chamberByIdWithPropertyAndCreator = async (id) => {
    // Data
    const _id = new ObjectId(id);

    // Database fetch
    return await embeddedChamberFetch([
        chamberPropertyLookup,
        generalHelpers.databaseUnwind("$building"),
        generalConstants.LOOP_DIRECTIVE.CREATOR,
        generalHelpers.databaseUnwind("$creator"),
        { $match : {_id} }
    ]);
};

// Fetch all property chambers into database
module.exports.propertyChambers = async (property) => {
    return await atomicChambersFetch({deleted: false, property: new ObjectId(property)});
};

// Check if property has chamber into database
module.exports.propertyHasChamber = async (property, chamber) => {
    return await atomicChamberFetch({_id: new ObjectId(chamber), deleted: true, property: new ObjectId(property)});
};

// Fetch all property free chambers into database
module.exports.propertyFreeChambers = async (property) => {
    return await atomicChambersFetch({deleted: true, occupied: false, property: new ObjectId(property)});
};

// Create chamber
module.exports.createChamber = async ({name, phone, rent, type, property, description, creator}) => {
    // Data
    const deleted = false;
    const occupied = false;
    const updatable = true;
    const deletable = true;
    const deleted_at = null;
    const created_by = creator;
    const created_at = new Date();

    // Keep into database
    const atomicChamberCreateData = await atomicChamberCreate({
        name, phone, rent, type,
        property: new ObjectId(property),
        deleted, updatable, deletable, occupied,
        description, created_by, created_at, deleted_at
    });
    if(!atomicChamberCreateData.status) {
        return atomicChamberCreateData;
    }

    // Push property chambers & update occupation
    const createdChamberId = atomicChamberCreateData.data;
    await propertiesHelpers.updatePropertyChamberByPropertyId(property, createdChamberId);

    return atomicChamberCreateData;
};

// Update chamber
module.exports.updateChamber = async ({id, name, phone, rent, type, property, description}) => {
    // Updatable check & fetch
    const atomicChamberFetchData = await atomicChamberFetch({_id: new ObjectId(id), updatable: true});
    if(!atomicChamberFetchData.status) {
        return {...atomicChamberFetchData, message: errorConstants.CHAMBERS.UPDATE_CHAMBER}
    }

    // Update chamber info
    const atomicChamberUpdateData = await atomicChamberUpdate(id, {
        $set: {name, phone, rent, description, type, property: new ObjectId(property)}
    });
    if(!atomicChamberUpdateData.status) {
        return atomicChamberUpdateData;
    }

    // Old and new property management
    const oldProperty = atomicChamberFetchData.data.property;
    if(oldProperty !== property) {
        // Remove old chamber property id different from new property
        await propertiesHelpers.updatePropertyChamberByPropertyId(oldProperty, id, false);
        // Add new chamber property id different from new property
        await propertiesHelpers.updatePropertyChamberByPropertyId(property, id);
    }

    return atomicChamberUpdateData;
};

// Add chamber good by chamber id
module.exports.addChamberGoodByChamberId = async (id, goodId) => {
    return await atomicChamberUpdate(id, {$addToSet: {goods: new ObjectId(goodId)}});
};

// Remove chamber good by chamber id
module.exports.removeChamberGoodByChamberId = async (id, goodId) => {
    return await atomicChamberUpdate(id, {$pull: {goods: new ObjectId(goodId)}});
};

// Add chamber picture by chamber id
module.exports.addChamberPictureByChamberId = async (id, picture) => {
    return await atomicChamberUpdate(id, {$push: {pictures: picture}});
};

// Remove chamber picture by chamber id
module.exports.removeChamberPictureByChamberId = async (id, pictureId) => {
    return await atomicChamberUpdate(id, {$pull: {pictures: {id: pictureId}}});
};

// Delete chamber
module.exports.deleteChamberByChamberId = async (id) => {
    // Deletable check & fetch
    const atomicChamberFetchData = await atomicChamberFetch({_id: new ObjectId(id), deletable: true});
    if(!atomicChamberFetchData.status) {
        return {...atomicChamberFetchData, message: errorConstants.CHAMBERS.DELETE_CHAMBER}
    }

    // TODO: Implement archive procedures

    // Archive chamber goods
    const goods = atomicChamberFetchData.data.goods;
    if(goods && goods?.length > 0) {
        for(const good of goods) {
            await goodsHelpers.simpleArchiveGoodByGoodId(good);
        }
    }

    return await atomicChamberUpdate(id, {$set: {enable: false}});
}

// Archive chamber
module.exports.archiveChamberByChamberId = async (id) => {
    // Deletable check & fetch
    const atomicChamberFetchData = await atomicChamberFetch({_id: new ObjectId(id), deletable: true});
    if(!atomicChamberFetchData.status) {
        return {...atomicChamberFetchData, message: errorConstants.CHAMBERS.DELETE_CHAMBER}
    }

    // TODO: Implement archive procedures

    // Remove property chamber
    const property = atomicChamberFetchData.data.property;
    await propertiesHelpers.updatePropertyChamberByPropertyId(property, id, false);

    // Archive chamber goods
    const goods = atomicChamberFetchData.data.goods;
    if(goods && goods?.length > 0) {
        for(const good of goods) {
            await goodsHelpers.simpleArchiveGoodByGoodId(good);
        }
    }

    return await atomicChamberUpdate(id, {$set: {deleted: false, deleted_at: new Date()}});
};

// Embedded chambers fetch into database
const embeddedChambersFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedChambersFetchData = await client.db().collection(chambersCollection)
            .aggregate(directives)
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        embeddedChambersFetchData.forEach(item => data.push(new ChamberModel(item).simpleResponseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Embedded chamber fetch into database
const embeddedChamberFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedChamberFetchData = await client.db().collection(chambersCollection)
            .aggregate(directives)
            .toArray();
        // Format response
        if(embeddedChamberFetchData.length > 0) {
            status = true;
            data = new ChamberModel(embeddedChamberFetchData[0]).responseFormat;
        }
        else message = errorConstants.CHAMBERS.CHAMBER_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic chambers fetch into database
const atomicChambersFetch = async (directives) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicChambersFetchData = await client.db().collection(chambersCollection)
            .find(directives)
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        atomicChambersFetchData.forEach(item => data.push(new ChamberModel(item).simpleResponseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic chamber fetch into database
const atomicChamberFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicChamberFetchData = await client.db().collection(chambersCollection).findOne(directives);
        // Format response
        if(atomicChamberFetchData !== null) {
            status = true;
            data = new ChamberModel(atomicChamberFetchData);
        }
        else message = errorConstants.CHAMBERS.CHAMBER_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic chamber create into database
const atomicChamberCreate = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicChamberCreateData = await client.db().collection(chambersCollection).insertOne(directives);
        // Format response
        if(atomicChamberCreateData.acknowledged && atomicChamberCreateData.insertedId) {
            data = atomicChamberCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.CHAMBERS.CREATE_CHAMBER;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic chamber update into database
const atomicChamberUpdate = async (id, directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        const _id = new ObjectId(id);
        // Query
        const atomicChamberUpdateData = await client.db().collection(chambersCollection).updateOne(
            {_id}, directives
        );
        // Format response
        if(atomicChamberUpdateData.matchedCount === 1 && atomicChamberUpdateData.modifiedCount === 0) {
            message = errorConstants.GENERAL.NO_CHANGES;
        }
        else if(atomicChamberUpdateData.modifiedCount === 1) status = true;
        else message = errorConstants.CHAMBERS.CHAMBER_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
