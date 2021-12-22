const {MongoClient} = require('mongodb');

const UserModel = require('../../models/userModel');
const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const rolesHelpers = require("../../helpers/mongodb/rolesHelpers");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");

// Data
const usersCollection = "users";
const administratorsRole = "Administrateur";
const databaseUrl = envConstants.DATABASE_URL;

// Get user by username
module.exports.userByUsername = async (username) => {
    return await atomicUserFetch({username});
};

// Get administrators without current user by username
module.exports.administratorsWithoutUserByUsername = async (username) => {
    return await atomicUsersFetch({
        role: administratorsRole, enable: true, username: {$ne: username}
    });
};

// Add user property by username
module.exports.addUserPropertyByUsername = async (username, propertyId) => {
    return await atomicUserUpdate(username, {$addToSet: {properties: propertyId}});
};

// Remove user property by username
module.exports.removeUserPropertyByUsername = async (username, propertyId) => {
    return await atomicUserUpdate(username, {$pull: {properties: propertyId}});
};

// Update user avatar by username
module.exports.updateUserAvatarByUsername = async (username, avatar) => {
    return await atomicUserUpdate(username, {$set: {avatar}});
};

// Update user password by username
module.exports.updateUserPasswordByUsername = async (username, password) => {
    return await atomicUserUpdate(username, {$set: {password}});
};

// Update user info by username
module.exports.updateUserInfoByUsername = async (username, {name, phone, email, description}) => {
    return await atomicUserUpdate(username, {$set: {name, phone, email, description}});
};

// Update user tokens by username
module.exports.updateUserTokensByUsername = async (username, tokens) => {
    return await atomicUserUpdate(username, {$set: {tokens}});
};

// Create user
module.exports.createUser = async ({name, phone, email, role, description, creator}) => {
    return await userCreateProcess({
        name, phone, email, role, description, creator
    });
};

// Create user
module.exports.createAdministrator = async ({name, phone, email, description, creator}) => {
    return await userCreateProcess({
        name, phone, email, role: administratorsRole, description, creator
    });
};

// User create process
const userCreateProcess = async ({name, phone, email, role, description, creator}) => {
    // Build username & check
    const username = name?.split(' ')?.join("_")?.toLowerCase();
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(userByUsernameData.status) {
        return {status: false, data: null, message: errorConstants.USERS.USER_ALREADY_EXIST};
    }

    // Get role permissions
    const roleByNameData = await rolesHelpers.roleByName(role);
    if(!roleByNameData.status) {
        return roleByNameData;
    }

    const enable = true;
    const created_by = creator;
    const created_at = new Date();
    const bcrypt = require("bcryptjs");
    const permissions = roleByNameData.permissions;
    const password = await bcrypt.hash("000000", 10);

    // Keep into database
    return await atomicUserCreate({
        username, name, password, enable, phone, email, role,
        description, permissions, created_by, created_at
    });
};

// Atomic users fetch into database
const atomicUsersFetch = async (directives) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUsersFetchData = await client.db().collection(usersCollection)
            .find(directives)
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        atomicUsersFetchData.forEach(item => data.push(new UserModel(item).simpleResponseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic user fetch into database
const atomicUserFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserFetchData = await client.db().collection(usersCollection).findOne(directives);
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
const atomicUserCreate = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserCreateData = await client.db().collection(usersCollection).insertOne(directives);
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
const atomicUserUpdate = async (username, directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserUpdateData = await client.db().collection(usersCollection).updateOne(
            {username}, directives
        );
        // Format response
        if(atomicUserUpdateData.matchedCount === 1 && atomicUserUpdateData.modifiedCount === 0) {
            message = errorConstants.GENERAL.NO_CHANGES;
        }
        else if(atomicUserUpdateData.modifiedCount === 1) status = true;
        else message = errorConstants.USERS.USER_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
