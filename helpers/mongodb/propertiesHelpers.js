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
    return await atomicPropertiesFetch();
};

// Fetch property by id into database
module.exports.propertyById = async (id) => {
    return await atomicPropertyFetch({_id: new ObjectId(id)});
};

// Fetch property by id with creator into database
module.exports.propertyByIdWithCreator = async (id) => {
    // Database fetch
    return await embeddedPropertyFetch([
        generalConstants.LOOP_DIRECTIVE.CREATOR,
        generalHelpers.databaseUnwind("$creator"),
        { $match : {_id: new ObjectId(id)} }
    ]);
};

// Create property
module.exports.createProperty = async ({name, phone, address, description, creator}) => {
    // Data
    const updatable = true;
    const deletable = true;
    const created_by = creator;
    const occupied_chambers = 0;
    const occupied_percentage = 0;
    const created_at = new Date();

    // Keep into database
    return await atomicPropertyCreate({
        name, phone, address, updatable, deletable,
        occupied_percentage, occupied_chambers,
        description, created_by, created_at
    });
};

// Update property
module.exports.updateProperty = async ({id, name, phone, address, description}) => {
    // Updatable check & fetch
    const atomicPropertyFetchData = await atomicPropertyFetch({_id: new ObjectId(id), updatable: true});
    if(!atomicPropertyFetchData.status) {
        return {...atomicPropertyFetchData, message: errorConstants.PROPERTIES.UPDATE_PROPERTY}
    }

    // Update property info
    return await atomicPropertyUpdate(id, {
        $set: {name, phone, address, description}
    });
};

// Add property picture by property id
module.exports.addPropertyPictureByPropertyId = async (id, picture) => {
    return await atomicPropertyUpdate(id, {$push: {pictures: picture}});
};

// Remove property picture by property id
module.exports.removePropertyPictureByPropertyId = async (id, pictureId) => {
    return await atomicPropertyUpdate(id, {$pull: {pictures: {id: pictureId}}});
};

// Update property chamber by property id
module.exports.updatePropertyChamberByPropertyId = async (id, chamberId, add = true) => {
    // Calculate occupation
    const atomicPropertyFetchData = await atomicPropertyFetch({_id: new ObjectId(id)});
    if(atomicPropertyFetchData.status) {
        const propertyData = atomicPropertyFetchData.data?.simpleResponseFormat;
        const newPropertyChambers = add ? propertyData.chambers + 1 : propertyData.chambers - 1;
        const occupiedPercentage = Math.round((propertyData.occupied_chambers * 100) / newPropertyChambers);
        return await atomicPropertyUpdate(id, {
            $addToSet: {chambers: new ObjectId(chamberId)},
            $set: {occupied_percentage: occupiedPercentage}
        });
    }
    return atomicPropertyFetchData;
};

// Delete property
module.exports.deletePropertyByPropertyId = async (id) => {
    // Deletable check
    const atomicPropertyFetchData = await atomicPropertyFetch({_id: new ObjectId(id), deletable: true});
    if(!atomicPropertyFetchData.status) {
        return {...atomicPropertyFetchData, message: errorConstants.PROPERTIES.DELETE_PROPERTY}
    }

    // Archive property chambers
    const chambers = atomicPropertyFetchData.data.chambers;
    if(chambers && chambers?.length > 0) {
        for(const chamber of chambers) {
            await chambersHelpers.deleteChamberByChamberId(chamber);
        }
    }
    return await atomicPropertyDelete(id);
};

// Atomic properties fetch into database
const atomicPropertiesFetch = async (filter) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertiesFetchData = await client.db().collection(propertiesCollection)
            .find(filter || {})
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
const embeddedPropertyFetch = async (pipeline) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedPropertyFetchData = await client.db().collection(propertiesCollection).aggregate(pipeline).toArray();
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
const atomicPropertyFetch = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyFetchData = await client.db().collection(propertiesCollection).findOne(filter);
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
const atomicPropertyCreate = async (document) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyCreateData = await client.db().collection(propertiesCollection).insertOne(document);
        // Format response
        if(atomicPropertyCreateData.acknowledged) {
            data = atomicPropertyCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.PROPERTIES.PROPERTY_CREATE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic property update into database
const atomicPropertyUpdate = async (filter, update) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyUpdateData = await client.db().collection(propertiesCollection).updateOne(filter, update);
        // Format response
        if(atomicPropertyUpdateData.acknowledged) {
            if(atomicPropertyUpdateData.modifiedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.PROPERTIES.PROPERTY_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic property delete into database
const atomicPropertyDelete = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyDeleteData = await client.db().collection(propertiesCollection).deleteOne(filter);
        // Format response
        if(atomicPropertyDeleteData.acknowledged) {
            if(atomicPropertyDeleteData.deletedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.PROPERTIES.PROPERTY_DELETE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

