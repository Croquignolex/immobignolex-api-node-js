const {MongoClient} = require('mongodb');

const UserModel = require('../../models/userModel');
const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const collection = "users";
const document = "immobignolex";
const databaseUrl = envConstants.DATABASE_URL;

module.exports.users = async () => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db(document).collection(collection).find() || [];
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
        const dbData = await client.db(document).collection(collection).findOne({username});
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
