const {MongoClient} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const PropertyModel = require('../../models/propertyModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const usersCollection = "users";
const propertiesCollection = "properties";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all properties into database
module.exports.properties = async () => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(propertiesCollection).find().toArray();
        data = [];
        status = true;
        dbData.forEach(item => data.push((new PropertyModel(item)).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Fetch all properties with caretaker into database
module.exports.propertiesWithCaretaker = async () => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(propertiesCollection).aggregate([{
            $lookup: {
                from: usersCollection,
                localField: "caretaker",
                foreignField: "_id",
                as: "manager"
            }
        }]).toArray();
        data = [];
        status = true;
        dbData.forEach(item => data.push((new PropertyModel(item)).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Fetch property by id into database
module.exports.propertyById = async (_id) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(propertiesCollection).findOne({_id});
        if(dbData !== null) {
            status = true;
            data = new PropertyModel(dbData);
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

// Remove property picture into database
module.exports.updatePropertyPictures = async (_id, pictures) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(propertiesCollection).updateOne(
            {_id},
            {$set: {pictures}}
        );
        if(dbData !== null) status = true;
        else message = errorConstants.PROPERTIES.PROPERTIES_PICTURES_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Remove property picture into database
module.exports.deletePropertyPicture = async (propertyId, pictureId) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(propertiesCollection).updateOne(
            {_id: propertyId},
            {$pull: {pictures: {id: pictureId}}}
        );
        if(dbData !== null) status = true;
        else message = errorConstants.PROPERTIES.PROPERTY_PICTURE_DELETE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
