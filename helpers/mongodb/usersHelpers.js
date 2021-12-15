const {MongoClient} = require('mongodb');

const UserModel = require('../../models/userModel');
const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const usersCollection = "users";
const rolesCollection = "roles";
const propertiesCollection = "properties";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch users into database
module.exports.usersWithProperties = async () => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();
        const dbData = await client.db().collection(usersCollection).aggregate([{
            $lookup: {
                from: propertiesCollection,
                localField: "properties",
                foreignField: "_id",
                as: "managed_properties"
            }
        }]).toArray();
        data = [];
        status = true;
        dbData.forEach(item => data.push(new UserModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Fetch users by role into database
module.exports.usersByRoleWithProperties = async (role) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();
        const dbData = await client.db().collection(usersCollection).aggregate([{
            $lookup: {
                from: propertiesCollection,
                localField: "properties",
                foreignField: "_id",
                as: "managed_properties"
            }
        }]).toArray();
        console.log({dbData})
        data = [];
        status = true;
        dbData.forEach(item => data.push(new UserModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Fetch create user into database
module.exports.createUser = async ({name, phone, email, role, description, creator}) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();

        const dbRolesData = await client.db().collection(rolesCollection).findOne({name: role});
        if(dbRolesData !== null) {
            // Role permissions
           const permissions = dbRolesData.permissions;
            const dbData = await client.db().collection(usersCollection).insertOne({
                name, phone, email, role, description, permissions, created_by: creator, created_at: new Date()
            });
            if(dbData.acknowledged) status = true;
            else message = errorConstants.USERS.CREATE_USER;
        } else message = errorConstants.ROLES.NOT_FOUND_BY_NAME;
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
        await client.connect();
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
        await client.connect();
        const dbData = await client.db().collection(usersCollection).updateOne(
            {username},
            {$set: {tokens}}
        );
        if(dbData.modifiedCount === 1) status = true;
        else message = errorConstants.USERS.USER_TOKENS_UPDATE;
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
        await client.connect();
        const dbData = await client.db().collection(usersCollection).updateOne(
            {username},
            {$set: {avatar}}
        );
        if(dbData.modifiedCount === 1) status = true;
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
        await client.connect();
        const dbData = await client.db().collection(usersCollection).updateOne(
            {username},
            {$set: {name, phone, email, description}}
        );
        if(dbData.modifiedCount === 1) status = true;
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
        await client.connect();
        const dbData = await client.db().collection(usersCollection).updateOne(
            {username},
            {$set: {password}}
        );
        if(dbData.modifiedCount === 1) status = true;
        else message = errorConstants.USERS.USER_INFO_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
