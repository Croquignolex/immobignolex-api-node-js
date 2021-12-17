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
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const tenantsData = await client.db().collection(usersCollection).find().toArray();
        // Format response
        data = [];
        status = true;
        tenantsData.forEach(item => data.push(new TenantModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
