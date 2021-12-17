const {MongoClient} = require('mongodb');

const UserModel = require('../../models/userModel');
const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const usersCollection = "users";
const rolesCollection = "roles";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch users into database
module.exports.users = async (username) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();
        const dbData = await client.db().collection(usersCollection).find({
            username: {$ne: username},
            enable: true,
        }).sort({created_at: -1}).toArray();
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
module.exports.usersByRole = async (role, username) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();
        const dbData = await client.db().collection(usersCollection).find({
            role,
            enable: true,
            username: {$ne: username}
        }).sort({created_at: -1}).toArray();
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
module.exports.createUser = async ({name, phone, email, username, role, description, creator}) => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect();

        const dbRolesData = await client.db().collection(rolesCollection).findOne({name: role});
        if(dbRolesData !== null) {
            // Role permissions & data
            const enable = true;
            const created_by = creator;
            const created_at = new Date();
            const bcrypt = require("bcryptjs");
            const permissions = dbRolesData.permissions;
            const password = await bcrypt.hash("000000", 10);
            // Query
            const dbData = await client.db().collection(usersCollection).insertOne({
                username, name, password, enable, phone, email, role,
                description, permissions, created_by, created_at
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

// Atomic user fetch into database
module.exports.atomicUserFetch = async (atomicFields) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserFetchData = await client.db().collection(usersCollection).findOne({atomicFields});
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

// Atomic user update into database
module.exports.atomicUserUpdate = async (username, atomicFields) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserUpdateData = await client.db().collection(usersCollection).updateOne(
            {username},
            {$set: atomicFields}
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

