const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const PropertyModel = require('../../models/propertyModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const generalConstants = require('../../constants/generalConstants');
const chambersHelpers = require("../../helpers/mongodb/chambersHelpers");

// Data
const propertiesCollection = "properties";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all properties into database
module.exports.properties = async () => {
    return await atomicPropertiesFetch({enable: true});
};

// Fetch property by id into database
module.exports.propertyById = async (id) => {
    return await atomicPropertyFetch({_id: new ObjectId(id)});
};

// Fetch property by id with creator into database
module.exports.propertyByIdWithCreator = async (id) => {
    // Data
    const _id = new ObjectId(id);

    // Database fetch
    return await embeddedPropertyFetch([
        generalConstants.LOOP_DIRECTIVE.CREATOR,
        generalHelpers.databaseUnwind("$creator"),
        { $match : {_id} }
    ]);
};

// Add property picture by property id
module.exports.addPropertyPictureByPropertyId = async (id, picture) => {
    return await atomicPropertyUpdate(id, {$push: {pictures: picture}});
};

// Remove property picture by property id
module.exports.removePropertyPictureByPropertyId = async (id, pictureId) => {
    return await atomicPropertyUpdate(id, {$pull: {pictures: {id: pictureId}}});
};

// Remove property chamber by property id
module.exports.removePropertyChamberByPropertyId = async (id, chamberId, isOccupied) => {
    // Calculate occupation
    const atomicPropertyFetchData = await atomicPropertyFetch({_id: new ObjectId(id)});
    const propertyData = atomicPropertyFetchData.data?.simpleResponseFormat;
    const occupiedChambers = propertyData.occupied;
    const occupied = isOccupied ? occupiedChambers - 1 : occupiedChambers;
    const occupation = Math.round((occupied * 100) / (propertyData.chambers - 1)) || 0;
    // Update
    return await atomicPropertyUpdate(id, {$pull: {chambers: new ObjectId(chamberId)}, $set: {occupation, occupied}});
};

// Add property chamber by property id
module.exports.addPropertyChamberByPropertyId = async (id, chamberId, isOccupied) => {
    // Calculate occupation
    const atomicPropertyFetchData = await atomicPropertyFetch({_id: new ObjectId(id)});
    const propertyData = atomicPropertyFetchData.data?.simpleResponseFormat;
    const occupiedChambers = propertyData.occupied;
    const occupied = isOccupied ? occupiedChambers + 1 : occupiedChambers;
    const occupation = Math.round((occupied * 100) / (propertyData.chambers + 1));
    // Update
    return await atomicPropertyUpdate(id, {$addToSet: {chambers: new ObjectId(chamberId)}, $set: {occupation, occupied}});
};

// Create property
module.exports.createProperty = async ({name, phone, address, description, creator}) => {
    // Data
    const enable = true;
    const created_by = creator;
    const created_at = new Date();

    // Keep into database
    return await atomicPropertyCreate({
        name, phone, address, enable, occupation: 0, occupied: 0, description, created_by, created_at
    });
};

// Update property
module.exports.updateProperty = async ({id, name, phone, address, description}) => {
    // Update property info
    return await atomicPropertyUpdate(id, {
        $set: {name, phone, address, description}
    });
};

// Archive property
module.exports.archivePropertyByPropertyId = async (id) => {
    // TODO: Implement archive procedures

    // Data
    const _id = new ObjectId(id);

    // Fetch old property caretaker
    const atomicPropertyFetchData = await atomicPropertyFetch({_id});
    if(!atomicPropertyFetchData.status) {
        return atomicPropertyFetchData;
    }

    // Archive property chambers
    const chambers = atomicPropertyFetchData.data.chambers;
    if(chambers && chambers?.length > 0) {
        for(const chamber of chambers) {
            await chambersHelpers.simpleArchiveChamberByChamberId(chamber);
        }
    }

    return await atomicPropertyUpdate(id, {$set: {enable: false}});
};

// Atomic properties fetch into database
const atomicPropertiesFetch = async (directives) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertiesFetchData = await client.db().collection(propertiesCollection)
            .find(directives)
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        atomicPropertiesFetchData.forEach(item => data.push(new PropertyModel(item).simpleResponseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Embedded property fetch into database
const embeddedPropertyFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedPropertyFetchData = await client.db().collection(propertiesCollection)
            .aggregate(directives)
            .toArray();
        // Format response
        if(embeddedPropertyFetchData.length > 0) {
            status = true;
            data = new PropertyModel(embeddedPropertyFetchData[0]).responseFormat;
        }
        else message = errorConstants.PROPERTIES.PROPERTY_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic property fetch into database
const atomicPropertyFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyFetchData = await client.db().collection(propertiesCollection).findOne(directives);
        // Format response
        if(atomicPropertyFetchData !== null) {
            status = true;
            data = new PropertyModel(atomicPropertyFetchData);
        }
        else message = errorConstants.PROPERTIES.PROPERTY_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic property create into database
const atomicPropertyCreate = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyCreateData = await client.db().collection(propertiesCollection).insertOne(directives);
        // Format response
        if(atomicPropertyCreateData.acknowledged && atomicPropertyCreateData.insertedId) {
            data = atomicPropertyCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.PROPERTIES.CREATE_PROPERTY;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic property update into database
const atomicPropertyUpdate = async (id, directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        const _id = new ObjectId(id);
        // Query
        const atomicPropertyUpdateData = await client.db().collection(propertiesCollection).updateOne(
            {_id}, directives
        );
        // Format response
        if(atomicPropertyUpdateData.matchedCount === 1 && atomicPropertyUpdateData.modifiedCount === 0) {
            message = errorConstants.GENERAL.NO_CHANGES;
        }
        else if(atomicPropertyUpdateData.modifiedCount === 1) status = true;
        else message = errorConstants.PROPERTIES.PROPERTY_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
