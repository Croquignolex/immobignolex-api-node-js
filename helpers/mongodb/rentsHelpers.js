const {MongoClient, ObjectId} = require('mongodb');

const RentModel = require("../../models/rentModel");
const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const rentsCollection = "rents";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all lease rents into database
module.exports.leaseRents = async (lease) => {
    return await atomicRentsFetch({lease: new ObjectId(lease)});
};

// Create invoice
module.exports.createRent = async ({amount, tenant, chamber, property, lease, start, end, creator, payed = false}) => {
    // Data
    const advance = false;
    const canceled = false;
    const updatable = false;
    const deletable = false;
    const cancelable = false;
    const created_by = creator;
    const created_at = new Date();
    const payed_at = payed ? new Date() : null;
    const reference = "RENT" + created_at?.getTime();

    // Keep into database
    return await atomicRentCreate({
        start_at: start, end_at: end, payed_at,
        payed, advance, deletable, updatable, canceled,
        created_by, created_at, amount, tenant, cancelable, reference,
        property: new ObjectId(property), chamber: new ObjectId(chamber), lease: new ObjectId(lease),
    });
};

// Atomic rents fetch into database
const atomicRentsFetch = async (filter) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicRentsFetchData = await client.db().collection(rentsCollection)
            .find(filter || {})
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        atomicRentsFetchData.forEach(item => data.push(new RentModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic rent create into database
const atomicRentCreate = async (document) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicRentCreateData = await client.db().collection(rentsCollection).insertOne(document);
        // Format response
        if(atomicRentCreateData.acknowledged) {
            data = atomicRentCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.RENTS.RENT_CREATE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
