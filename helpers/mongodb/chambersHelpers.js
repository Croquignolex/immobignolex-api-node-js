const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const ChamberModel = require('../../models/chamberModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
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
        as: "container"
    }
};

// Fetch all chambers with property into database
module.exports.chambersWithCaretaker = async () => {
    return await embeddedChambersFetch([
        chamberPropertyLookup,
        generalHelpers.databaseUnwind("$container"),
        { $match : {enable: true} }
    ]);
};

// Fetch chamber with property into database
module.exports.chamberByIdWithPropertyAndCreator = async (id) => {
    // Data
    const _id = new ObjectId(id);

    // Database fetch
    return await embeddedChamberFetch([
        chamberPropertyLookup,
        generalHelpers.databaseUnwind("$container"),
        generalConstants.LOOP_DIRECTIVE.CREATOR,
        generalHelpers.databaseUnwind("$creator"),
        { $match : {_id} }
    ]);
};

// Add chamber picture by chamber id
module.exports.addChamberPictureByChamberId = async (id, picture) => {
    return await atomicChamberUpdate(id, {$push: {pictures: picture}});
};

// Remove chamber picture by chamber if
module.exports.removeChamberPictureByChamberId = async (id, pictureId) => {
    return await atomicChamberUpdate(id, {$pull: {pictures: {id: pictureId}}});
};

// Create chamber
module.exports.createChamber = async ({name, phone, rent, type, property, description, creator}) => {
    // Data
    const enable = true;
    const created_by = creator;
    const created_at = new Date();

    // Keep into database
    const atomicChamberCreateData = await atomicChamberCreate({
        name, phone, rent, enable, description, type, property, created_by, created_at
    });
    if(!atomicChamberCreateData.status) {
        return atomicChamberCreateData;
    }

    // Push property chambers
    if(property) {
        const createdChamberId = atomicChamberCreateData.data;
        return await propertiesHelpers.addPropertyChamberByPropertyId(property, createdChamberId);
    }

    return atomicChamberCreateData;
};

// Update chamber
module.exports.updateChamber = async ({id, name, phone, rent, type, property, description}) => {
    // Data
    const _id = new ObjectId(id);

    // Fetch old chamber property
    const atomicChamberFetchData = await atomicChamberFetch({_id});
    if(!atomicChamberFetchData.status) {
        return atomicChamberFetchData;
    }

    // Update chamber info
    const atomicChamberUpdateData = await atomicChamberUpdate(_id, {
        $set: {name, phone, rent, description, type, property: new ObjectId(property)}
    });
    if(!atomicChamberUpdateData.status) {
        return atomicChamberUpdateData;
    }

    // Old and new property management
    const oldProperty = atomicChamberFetchData.data.property;
    if(oldProperty !== property) {
        // Remove old chamber property id different from new property
        if(oldProperty) {
            const removePropertyChamberByPropertyIdData = await propertiesHelpers.removePropertyChamberByPropertyId(oldProperty, _id);
            if(!removePropertyChamberByPropertyIdData.status) {
                return removePropertyChamberByPropertyIdData;
            }
        }
        // Add new caretaker property id different from new caretaker
        if(property) {
            const addPropertyChamberByPropertyIdData = await propertiesHelpers.addPropertyChamberByPropertyId(property, _id);
            if(!addPropertyChamberByPropertyIdData.status) {
                return addPropertyChamberByPropertyIdData;
            }
        }
    }

    return atomicChamberUpdateData;
};

// Archive chamber
module.exports.archiveChamberByChamberId = async (id) => {
    // TODO: Implement archive procedures

    // Data
    const _id = new ObjectId(id);

    // Fetch old chamber property
    const atomicChamberFetchData = await atomicChamberFetch({_id});
    if(!atomicChamberFetchData.status) {
        return atomicChamberFetchData;
    }

    // Remove old caretaker property id
    const property = atomicChamberFetchData.data.property;
    if(property) {
        const removePropertyChamberByPropertyIdData = await propertiesHelpers.removePropertyChamberByPropertyId(property, _id);
        if(!removePropertyChamberByPropertyIdData.status) {
            return removePropertyChamberByPropertyIdData;
        }
    }

    return await atomicChamberUpdate(id, {$set: {enable: false, property: null}});
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
