const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const usersHelpers = require('../mongodb/usersHelpers');
const leasesHelpers = require('../mongodb/leasesHelpers');
const envConstants = require('../../constants/envConstants');
const chambersHelpers = require('../mongodb/chambersHelpers');
const errorConstants = require('../../constants/errorConstants');
const propertiesHelpers = require('../mongodb/propertiesHelpers');

// Data
const rentsCollection = "rents";
const databaseUrl = envConstants.DATABASE_URL;

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

    // Keep into database
    const atomicRentCreateData = await atomicRentCreate({
        start_at: start, end_at: end,
        payed, advance, deletable, updatable, canceled,
        created_by, created_at, amount, tenant, cancelable,
        property: new ObjectId(property), chamber: new ObjectId(chamber), lease: new ObjectId(lease),
    });
    if(!atomicRentCreateData.status) {
        return atomicRentCreateData;
    }

    // Push lease, chamber & tenant rent
    const createdRentId = atomicRentCreateData.data;
    await leasesHelpers.addLeaseRentByLeaseId(lease, createdRentId);
    await chambersHelpers.addChamberRentByChamberId(chamber, createdRentId);
    await usersHelpers.addTenantRentByTenantUsername(tenant, createdRentId);
    await propertiesHelpers.addPropertyRentByPropertyId(property, createdRentId);

    return atomicRentCreateData;
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
