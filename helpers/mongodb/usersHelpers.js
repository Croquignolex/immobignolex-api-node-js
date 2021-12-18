const {MongoClient} = require('mongodb');

const UserModel = require('../../models/userModel');
const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const usersCollection = "users";
const databaseUrl = envConstants.DATABASE_URL;

// Atomic users fetch into database
module.exports.atomicUsersFetch = async (atomicFields) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUsersFetchData = await client.db().collection(usersCollection).find(atomicFields).sort(
            {created_at: -1}
        ).toArray();
        // Format response
        data = [];
        status = true;
        atomicUsersFetchData.forEach(item => data.push(new UserModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic user fetch into database
module.exports.atomicUserFetch = async (atomicFields) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserFetchData = await client.db().collection(usersCollection).findOne({atomicFields});
        // Format response
        if(atomicUserFetchData !== null) {
            status = true;
            data = new UserModel(atomicUserFetchData);
        }
        else message = errorConstants.USERS.USER_NOT_FOUND;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic user create into database
module.exports.atomicUserCreate = async (atomicFields) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserCreateData = await client.db().collection(usersCollection).insertOne(atomicFields);
        // Format response
        if(atomicUserCreateData.acknowledged && atomicUserCreateData.insertedId) {
            data = atomicUserCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.USERS.CREATE_USER;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic user update into database
module.exports.atomicUserUpdate = async (username, atomicFields) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserUpdateData = await client.db().collection(usersCollection).updateOne(
            {username}, atomicFields
        );
        // Format response
        if(atomicUserUpdateData.modifiedCount === 1) status = true;
        else message = errorConstants.USERS.USER_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

