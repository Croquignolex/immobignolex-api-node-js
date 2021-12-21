const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const PropertyModel = require('../../models/propertyModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const usersCollection = "users";
const propertiesCollection = "properties";
const databaseUrl = envConstants.DATABASE_URL;
const propertyCaretakerLookup = {
    $lookup: {
        from: usersCollection,
        localField: "caretaker",
        foreignField: "username",
        as: "manager"
    }
};
const propertyCreatorLookup = {
    $lookup: {
        from: usersCollection,
        localField: "created_by",
        foreignField: "username",
        as: "creator"
    },
};

// Fetch all properties with caretaker into database
module.exports.propertiesWithCaretaker = async () => {
    return await embeddedPropertiesFetch([
        propertyCaretakerLookup,
        generalHelpers.databaseUnwind("$manager"),
        { $match : {enable: true} }
    ]);
};

// Fetch property with caretaker into database
module.exports.propertyByIdWithCaretakerAndCreator = async (id) => {
    // Data
    const _id = new ObjectId(id);

    // Database fetch
    return await embeddedPropertyFetch([
        propertyCaretakerLookup,
        generalHelpers.databaseUnwind("$manager"),
        propertyCreatorLookup,
        generalHelpers.databaseUnwind("$creator"),
        { $match : {_id} }
    ]);
};

// Add property picture by property if
module.exports.addPropertyPictureByPropertyId = async (id, picture) => {
    return await atomicPropertyUpdate(id, {$push: {pictures: picture}});
};

// Remove property picture by property if
module.exports.removePropertyPictureByPropertyId = async (id, pictureId) => {
    return await atomicPropertyUpdate(id, {$pull: {pictures: {id: pictureId}}});
};

// Fetch update property info into database
module.exports.updateProperty = async ({id, name, phone, address, caretaker, description}) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();
        const _id = new ObjectId(id);
        // Search old caretaker
        const dbDataExternal = await client.db().collection(propertiesCollection).aggregate([
            propertyCaretakerLookup,
            generalHelpers.databaseUnwind("$manager"),
            { $match : {_id} }
        ]).toArray();


        if(dbData.length > 0) {
            status = true;
            data = new PropertyModel(dbData[0]).responseFormat;
        } else message = errorConstants.PROPERTIES.NOT_FOUND_BY_ID;



        const dbData = await client.db().collection(propertiesCollection).updateOne(
            {_id},
            {$set: {name, phone, address, description, caretaker}}
        );
        if(dbData.matchedCount === 1 && dbData.modifiedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
        else if(dbData.modifiedCount === 1) {
            if(caretaker) {
                // Update caretaker document
                const dbDataEmbedded = await client.db().collection(usersCollection).updateOne(
                    {username: caretaker},
                    {$addToSet: {properties: _id}}
                );
                if(dbDataEmbedded.modifiedCount === 1) status = true;
                else message = errorConstants.USERS.USER_PROPERTIES_UPDATE;
            } else status = true;
        }
        else message = errorConstants.PROPERTIES.PROPERTIES_INFO_UPDATE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Embedded property fetch into database
const embeddedPropertyFetch = async (embeddedFields) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedPropertyFetchData = await client.db().collection(propertiesCollection)
            .aggregate(embeddedFields)
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

// Embedded properties fetch into database
const embeddedPropertiesFetch = async (embeddedFields) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedPropertiesFetchData = await client.db().collection(propertiesCollection)
            .aggregate(embeddedFields)
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        embeddedPropertiesFetchData.forEach(item => data.push(new PropertyModel(item).simpleResponseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic property create into database
const atomicPropertyCreate = async (atomicFields) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyCreateData = await client.db().collection(propertiesCollection).insertOne(atomicFields);
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
const atomicPropertyUpdate = async (id, atomicFields) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        const _id = new ObjectId(id);
        // Query
        const atomicPropertyUpdateData = await client.db().collection(propertiesCollection).updateOne(
            {_id}, atomicFields
        );
        // Format response
        if(atomicPropertyUpdateData.modifiedCount === 1) status = true;
        else message = errorConstants.PROPERTIES.PROPERTY_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

module.exports.atomicPropertyCreate = atomicPropertyCreate;
