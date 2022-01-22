const {MongoClient, ObjectId} = require('mongodb');

const UserModel = require('../../models/userModel');
const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const rolesHelpers = require("../../helpers/mongodb/rolesHelpers");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const generalConstants = require("../../constants/generalConstants");

// Data
const usersCollection = "users";
const databaseUrl = envConstants.DATABASE_URL;
const roles = {employee: "Employé", tenant: "Locataire", admin: "Administrateur"}

// Get user by username
module.exports.userByUsername = async (username) => {
    return await atomicUserFetch({username});
};

// Get tenant by username
module.exports.tenantByUsername = async (username) => {
    return await atomicUserFetch({username, role: roles.tenant});
};

// Get user by username with creator
module.exports.userByUsernameWithCreator = async (username) => {
    return await embeddedUserFetch([
        generalConstants.LOOP_DIRECTIVE.CREATOR,
        generalHelpers.databaseUnwind("$creator"),
        { $match : {username} }
    ]);
};

// Get administrators without current user by username
module.exports.administratorsWithoutUserByUsername = async (username) => {
    return await atomicUsersFetch({role: roles.admin, username: {$ne: username}});
};

// Get employees without current user by username
module.exports.employeesWithoutUserByUsername = async (username) => {
    return await atomicUsersFetch({role: roles.employee, username: {$ne: username}});
};

// Get tenants without current user by username
module.exports.tenantsWithoutUserByUsername = async (username) => {
    return await atomicUsersFetch({role: roles.tenant, username: {$ne: username}});
};

// Update user avatar by username
module.exports.updateUserAvatarByUsername = async (username, avatar) => {
    return await atomicUserUpdate({username}, {$set: {avatar}});
};

// Update user password by username
module.exports.updateUserPasswordByUsername = async (username, password) => {
    return await atomicUserUpdate({username}, {$set: {password}});
};

// Update user status by username
module.exports.updateUserStatusByUsername = async (username, status) => {
    return await atomicUserUpdate({username}, {$set: {enable: status}});
};

// Update user info by username
module.exports.updateUserInfoByUsername = async ({username, name, phone, email, cni, post, description}) => {
    return await atomicUserUpdate(
        {username, updatable: true},
        {$set: {name, phone, email, cni, post, description}}
    );
};

// Update user tokens by username
module.exports.updateUserTokensByUsername = async (username, tokens) => {
    return await atomicUserUpdate({username}, {$set: {tokens}});
};

// Create admin
module.exports.createAdministrator = async ({name, phone, email, cni, description, creator}) => {
    return await userCreateProcess({
        name, phone, email, cni, description, creator, role: roles.admin
    });
};

// Create employee
module.exports.createEmployee = async ({name, phone, email, cni, post, description, creator}) => {
    return await userCreateProcess({
        name, phone, email, cni, post, description, creator, role: roles.employee
    });
};

// Create tenant
module.exports.createTenant = async ({name, phone, email, cni, description, creator}) => {
    return await userCreateProcess({
        name, phone, email, cni, description, creator, balance: 0, role: roles.tenant
    });
};

// Delete user
module.exports.deleteUserByUsername = async (username) => {
    return await atomicUserDelete({username, deletable: true});
};

// Add tenant invoice by tenant username
module.exports.addTenantInvoiceByTenantUsername = async (username, invoiceId) => {
    return await atomicUserUpdate(
        {username, role: roles.tenant},
        {
            $addToSet: {invoices: new ObjectId(invoiceId)},
            $set: {deletable: false, updatable: false}
        }
    );
};

// Add tenant payment by tenant username
module.exports.addTenantPaymentByTenantUsername = async (username, paymentId) => {
    return await atomicUserUpdate(
        {username, role: roles.tenant},
        {
            $addToSet: {payments: new ObjectId(paymentId)},
            $set: {deletable: false, updatable: false}
        }
    );
};

// User create process
const userCreateProcess = async ({name, phone, email, role, cni, post, balance, description, creator}) => {
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

    const bcrypt = require("bcryptjs");

    // Data
    const enable = true;
    const updatable = true;
    const deletable = true;
    const created_by = creator;
    const created_at = new Date();
    const password = await bcrypt.hash("000000", 10);
    const permissions = roleByNameData.data.permissions;

    // Keep into database
    return await atomicUserCreate({
        username, name, password, phone, email, role, cni,
        description, permissions, created_by, created_at,
        enable, updatable, deletable, post, balance
    });
};

// Embedded user fetch into database
const embeddedUserFetch = async (pipeline) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedUserFetchData = await client.db().collection(usersCollection)
            .aggregate(pipeline)
            .toArray();
        // Format response
        if(embeddedUserFetchData.length > 0) {
            status = true;
            data = new UserModel(embeddedUserFetchData[0]).responseFormat;
        }
        else message = errorConstants.USERS.USER_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic users fetch into database
const atomicUsersFetch = async (filter) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUsersFetchData = await client.db().collection(usersCollection)
            .find(filter || {})
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
const atomicUserFetch = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserFetchData = await client.db().collection(usersCollection).findOne(filter);
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
const atomicUserCreate = async (document) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserCreateData = await client.db().collection(usersCollection).insertOne(document);
        // Format response
        if(atomicUserCreateData.acknowledged) {
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
const atomicUserUpdate = async (filter, update) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserUpdateData = await client.db().collection(usersCollection).updateOne(filter, update);
        // Format response
        if(atomicUserUpdateData.acknowledged) {
            if(atomicUserUpdateData.modifiedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.USERS.USER_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic user delete into database
const atomicUserDelete = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicUserDeleteData = await client.db().collection(usersCollection).deleteOne(filter);
        // Format response
        if(atomicUserDeleteData.acknowledged) {
            if(atomicUserDeleteData.deletedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.USERS.USER_DELETE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
