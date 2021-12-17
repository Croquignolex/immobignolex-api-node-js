const {MongoClient} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const ChamberModel = require('../../models/chamberModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const chambersCollection = "chambers";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all chambers into database
module.exports.chambers = async () => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const chambersData = await client.db().collection(chambersCollection).find().toArray();
        // Format response
        data = [];
        status = true;
        chambersData.forEach(item => data.push(new ChamberModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
