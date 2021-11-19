const {MongoClient} = require('mongodb');

const UserModel = require('../../models/userModel');
const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const usersCollection = "users";
const databaseUrl = envConstants.DATABASE_URL;

module.exports.users = async () => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(usersCollection).find() || [];
        data = [];
        status = true;
        dbData.forEach(item => data.push(new UserModel(item)));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client?.close(); }
    return {data, status, message};
};

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
    finally { await client?.close(); }
    return {data, status, message};
};

module.exports.updateUserTokensByUserId = async (userId, tokens) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(usersCollection).updateOne(
            {_id: userId},
            {$set: {tokens}}
        );
        if(dbData !== null) status = true;
        else message = errorConstants.TOKENS.TOKEN_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client?.close(); }
    return {data, status, message};
};
