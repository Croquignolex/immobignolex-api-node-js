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
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(chambersCollection).find().toArray();
        data = [];
        status = true;
        dbData.forEach(item => data.push((new ChamberModel(item)).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
