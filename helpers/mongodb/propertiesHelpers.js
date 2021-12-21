const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const PropertyModel = require('../../models/propertyModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const UserModel = require("../../models/userModel");

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

// Add property picture by property id
module.exports.addPropertyPictureByPropertyId = async (id, picture) => {
    return await atomicPropertyUpdate(id, {$push: {pictures: picture}});
};

// Remove property picture by property if
module.exports.removePropertyPictureByPropertyId = async (id, pictureId) => {
    return await atomicPropertyUpdate(id, {$pull: {pictures: {id: pictureId}}});
};

// Create property
module.exports.createProperty = async ({name, phone, address, description, caretaker, creator}) => {
    // Data
    const enable = true;
    const created_by = creator;
    const created_at = new Date();

    // Keep into database
    const atomicPropertyCreateData = await atomicPropertyCreate({
        name, phone, address, enable, description, caretaker, created_by, created_at
    });
    if(!atomicPropertyCreateData.status) {
        return atomicPropertyCreateData;
    }

    // Push caretaker properties
    if(caretaker) {
        const createdPropertyId = atomicPropertyCreateData.data;
        return await usersHelpers.addUserPropertyByUsername(caretaker, createdPropertyId);
    }

    return atomicPropertyCreateData;
};

// Update property
module.exports.updateProperty = async ({id, name, phone, address, caretaker, description}) => {
    // Data
    const _id = new ObjectId(id);

    // Fetch old property caretaker
    const atomicPropertyFetchData = await atomicPropertyFetch({_id});
    if(!atomicPropertyFetchData.status) {
        return atomicPropertyFetchData;
    }

    // Update property info
    const atomicPropertyUpdateData = await atomicPropertyUpdate(_id, {
        $set: {name, phone, address, description, caretaker}
    });
    if(!atomicPropertyUpdateData.status) {
        return atomicPropertyUpdateData;
    }

    // Old and new caretaker management
    const oldCaretaker = atomicPropertyFetchData.data.caretaker;
    if(oldCaretaker !== caretaker) {
        // Remove old caretaker property id different from new caretaker
        if(oldCaretaker) {
            const removeUserPropertyByUsernameData = await usersHelpers.removeUserPropertyByUsername(oldCaretaker, _id);
            if(!removeUserPropertyByUsernameData.status) {
                return removeUserPropertyByUsernameData;
            }
        }
        // Add new caretaker property id different from new caretaker
        if(caretaker) {
            const addUserPropertyByUsernameData = await usersHelpers.addUserPropertyByUsername(caretaker, _id);
            if(!addUserPropertyByUsernameData.status) {
                return addUserPropertyByUsernameData;
            }
        }
    }

    return atomicPropertyUpdateData;
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

// Embedded properties fetch into database
const embeddedPropertiesFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedPropertiesFetchData = await client.db().collection(propertiesCollection)
            .aggregate(directives)
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
        // Format response
        if(atomicPropertyUpdateData.matchedCount === 1 && atomicPropertyUpdateData.modifiedCount === 0) {
            message = errorConstants.GENERAL.NO_CHANGES;
        }
        else if(atomicPropertyUpdateData.modifiedCount === 1) status = true;
        else message = errorConstants.USERS.PROPERTY_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
