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
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();
        const dbData = await client.db().collection(propertiesCollection).aggregate([
            propertyCaretakerLookup,
            generalHelpers.databaseUnwind("$manager"),
            { $match : {enable: true} }
        ]).sort({created_at: -1}).toArray();
        data = [];
        status = true;
        dbData.forEach(item => data.push(new PropertyModel(item).simpleResponseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Fetch property with caretaker into database
module.exports.propertyByIdWithCaretakerAndCreator = async (id) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();
        const _id = new ObjectId(id);
        const dbData = await client.db().collection(propertiesCollection).aggregate([
            propertyCaretakerLookup,
            generalHelpers.databaseUnwind("$manager"),
            propertyCreatorLookup,
            generalHelpers.databaseUnwind("$creator"),
            { $match : {_id, enable: true} }
        ]).toArray();
        if(dbData.length > 0) {
            status = true;
            data = new PropertyModel(dbData[0]).responseFormat;
        }
        else message = errorConstants.PROPERTIES.NOT_FOUND_BY_ID;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Fetch create property into database
module.exports.createProperty = async ({name, phone, address, caretaker, description, creator}) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();

        // Data
        const enable = true;
        const created_by = creator;
        const created_at = new Date();
        // Query
        const dbData = await client.db().collection(propertiesCollection).insertOne({
            name, phone, address, enable, description, caretaker, created_by, created_at
        });
        if(dbData.acknowledged && dbData.insertedId) {
            if(caretaker) {
                // Update caretaker document
                const dbDataEmbedded = await client.db().collection(usersCollection).updateOne(
                    {username: caretaker},
                    {$push: {properties: dbData.insertedId}}
                );
                if(dbDataEmbedded.modifiedCount === 1) status = true;
                else message = errorConstants.USERS.USER_PROPERTIES_UPDATE;
            } else status = true;
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

// Remove property picture into database
module.exports.addPropertyPicture = async (id, picture) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();
        const _id = new ObjectId(id);
        const dbData = await client.db().collection(propertiesCollection).updateOne(
            {_id},
            {$push: {pictures: picture}}
        );
        if(dbData.modifiedCount === 1) status = true;
        else message = errorConstants.PROPERTIES.PROPERTIES_PICTURES_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Remove property picture into database
module.exports.deletePropertyPicture = async (id, pictureId) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const _id = new ObjectId(id);
        const dbData = await client.db().collection(propertiesCollection).updateOne(
            {_id},
            {$pull: {pictures: {id: pictureId}}}
        );
        if(dbData.modifiedCount === 1) status = true;
        else message = errorConstants.PROPERTIES.PROPERTY_PICTURE_DELETE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

