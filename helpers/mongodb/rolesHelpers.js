const {MongoClient} = require('mongodb');

const UserModel = require('../../models/userModel');
const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const rolesCollection = "roles";
const databaseUrl = envConstants.DATABASE_URL;

// Get role by name
module.exports.roleByName = async (name) => {
    return await atomicRoleFetch({name});
};

// Atomic roles fetch into database
const atomicRoleFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicRoleFetchData = await client.db().collection(rolesCollection).findOne(directives);
        // Format response
        if(atomicRoleFetchData !== null) {
            status = true;
            data = new UserModel(atomicRoleFetchData);
        }
        else message = errorConstants.ROLES.ROLE_NOT_FOUND;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
