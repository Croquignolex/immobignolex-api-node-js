const dayjs = require('dayjs');
const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const LeaseModel = require('../../models/leaseModel');
const envConstants = require('../../constants/envConstants');
const invoicesHelpers = require('../mongodb/invoicesHelpers');
const errorConstants = require('../../constants/errorConstants');

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
    const canceled = false;
    const updatable = false;
    const deletable = false;
    const created_by = creator;
    const created_at = new Date();
    const start_at = dayjs(leaseStartDate).toDate();
    const end_at = dayjs(leaseStartDate).add(1, leasePeriod).toDate();

    // Keep into database
    const atomicLeaseCreateData = await atomicLeaseCreate({
        property: new ObjectId(property), chamber: new ObjectId(chamber),
        created_by, created_at, start_at, end_at, rent, surety, deposit, tenant,
        commercial, canceled, updatable, deletable, description, leasePeriod, rentPeriod,
    });
    if(!atomicLeaseCreateData.status) {
        return atomicLeaseCreateData;
    }

    // Push property, chamber & tenant lease
    const createdLeaseId = atomicLeaseCreateData.data;

    // Generate invoice for surety
    if(surety > 0) {
        const suretyAmount = surety * rent;
        const reference = `Caution sur contract de bail de reference ${createdLeaseId}`;
        const createdInvoiceId = invoicesHelpers.createInvoice({
            lease: createdLeaseId, amount: suretyAmount,
            tenant, chamber, property,creator, reference,
        });
    }

    // Generate invoice for deposit
    if(deposit > 0) {
        const depositAmount = deposit * rent;
        const reference = `Avance sur loyer sur contract de bail de reference ${createdLeaseId}`;
        const createdInvoiceId = invoicesHelpers.createInvoice({
            lease: createdLeaseId, amount: depositAmount,
            tenant, chamber, property,creator, reference,
        });
    }


    // Push property contracts
    // Update property occupation
    // Push property invoices (deposit)

    // Push tenant contracts
    // Push tenant invoices (deposit)

    // Generate rents (also remaining one for the lease)
    // Push rents payments (only the ones of the given rents)

    // Update chamber contract (chamber no more free)
    // Push chamber invoices (deposit)


    return atomicLeaseCreateData;
};

// Atomic leases fetch into database
const atomicLeasesFetch = async (filter) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicLeasesFetchData = await client.db().collection(leasesCollection)
            .find(filter || {})
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
const atomicLeaseCreate = async (document) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const leasesCollectionData = await client.db().collection(leasesCollection).insertOne(document);
        // Format response
        if(leasesCollectionData.acknowledged) {
            data = leasesCollectionData.insertedId;
            status = true;
        }
        else message = errorConstants.LEASES.LEASE_CREATE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
