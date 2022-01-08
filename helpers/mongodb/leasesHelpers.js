const {MongoClient} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const LeaseModel = require('../../models/leaseModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const leasesCollection = "leases";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all leases into database
module.exports.leases = async () => {
    return await atomicLeasesFetch({enable: true});
};

// Atomic leases fetch into database
const atomicLeasesFetch = async (directives) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicLeasesFetchData = await client.db().collection(leasesCollection)
            .find(directives)
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        atomicLeasesFetchData.forEach(item => data.push(new LeaseModel(item).simpleResponseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
