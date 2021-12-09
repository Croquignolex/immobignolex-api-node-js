const {MongoClient} = require('mongodb');

const UserModel = require('../../models/userModel');
const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const usersCollection = "users";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all users into database
module.exports.users = async () => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(usersCollection).find().toArray();
        data = [];
        status = true;
        console.log({dbData})
        dbData.forEach(item => data.push(new UserModel(item)));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// fetch user by username into database
module.exports.userByUsername = async (username) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(usersCollection).findOne({username});
        if(dbData !== null) {
            status = true;
            data = new UserModel(dbData);
        }
        else message = errorConstants.USERS.NOT_FOUND_BY_USERNAME;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Update user token into database
module.exports.updateUserTokens = async (username, tokens) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(usersCollection).updateOne(
            {username},
            {$set: {tokens}}
        );
        if(dbData !== null) status = true;
        else message = errorConstants.USERS.USER_TOKEN_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Update user avatar into database
module.exports.updateUserAvatar = async (username, avatar) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(usersCollection).updateOne(
            {username},
            {$set: {avatar}}
        );
        if(dbData !== null) status = true;
        else message = errorConstants.USERS.USER_AVATAR_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Update user info into database
module.exports.updateUserInfo = async (username, {name, phone, email, description}) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(usersCollection).updateOne(
            {username},
            {$set: {name, phone, email, description}}
        );
        if(dbData !== null) status = true;
        else message = errorConstants.USERS.USER_INFO_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Update user password into database
module.exports.updateUserPassword = async (username, password) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(usersCollection).updateOne(
            {username},
            {$set: {password}}
        );
        if(dbData !== null) status = true;
        else message = errorConstants.USERS.USER_INFO_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
