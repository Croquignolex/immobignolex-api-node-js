const {MongoClient} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const TenantModel = require('../../models/tenantModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const usersCollection = "tenants";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all tenants into database
module.exports.tenants = async () => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(usersCollection).find().toArray();

        data = [];
        status = true;
        dbData.forEach(item => data.push(new TenantModel(item)));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
