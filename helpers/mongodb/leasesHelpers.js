const dayjs = require('dayjs');
const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const LeaseModel = require('../../models/leaseModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const customParseFormat = require("dayjs/plugin/customParseFormat");

// Data
const leasesCollection = "leases";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all leases into database
module.exports.leases = async () => {
    return await atomicLeasesFetch({enable: true});
};

// Create chamber
module.exports.createLease = async ({commercial, property, chamber, tenant, leasePeriod, rentPeriod,
                                        rent, surety, deposit, leaseStartDate, description, creator}) => {
    // Data
    const enable = true;
    const created_by = creator;
    const created_at = new Date();
    const start_at = dayjs(leaseStartDate).toDate();
    const end_at = dayjs(leaseStartDate).add(1, leasePeriod).toDate();

    // Keep into database
    const atomicLeaseCreateData = await atomicLeaseCreate({
        created_by, created_at, start_at, end_at,
        commercial,enable, description, leasePeriod, rentPeriod,
        property: new ObjectId(property), chamber: new ObjectId(chamber), tenant: new ObjectId(tenant),
        rent: parseInt(rent, 10) || 0, surety: parseInt(surety, 10) || 0, deposit: parseInt(deposit, 10) || 0,
    });
    if(!atomicLeaseCreateData.status) {
        return atomicLeaseCreateData;
    }

    // Push property contracts
    // Update property occupation
    // Update chamber contract (chamber no more free)
    // Push tenant contracts

    // Generate rents (also remaining one for the lease)
    // Push rents payments (only the ones of the given rents)
    // Generate invoice for deposit (given rents + given surety)

    // Push chamber invoices (deposit)
    // Push property invoices (deposit)
    // Push tenant invoices (deposit)

    return atomicLeaseCreateData;
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

// Atomic lease create into database
const atomicLeaseCreate = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const leasesCollectionData = await client.db().collection(leasesCollection).insertOne(directives);
        // Format response
        if(leasesCollectionData.acknowledged && leasesCollectionData.insertedId) {
            data = leasesCollectionData.insertedId;
            status = true;
        }
        else message = errorConstants.CHAMBERS.CREATE_CHAMBER;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
