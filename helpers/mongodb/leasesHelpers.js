const dayjs = require('dayjs');
const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const LeaseModel = require('../../models/leaseModel');
const rentsHelpers = require('../mongodb/rentsHelpers');
const usersHelpers = require("../mongodb/usersHelpers");
const envConstants = require('../../constants/envConstants');
const chambersHelpers = require("../mongodb/chambersHelpers");
const invoicesHelpers = require('../mongodb/invoicesHelpers');
const errorConstants = require('../../constants/errorConstants');
const generalConstants = require('../../constants/generalConstants');

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
    const canceled = false;
    const updatable = false;
    const deletable = false;
    const cancelable = true;
    const created_by = creator;
    const created_at = new Date();
    const start_at = dayjs(leaseStartDate).toDate();
    const end_at = dayjs(leaseStartDate).add(1, leasePeriod).toDate();

    // Keep into database
    const atomicLeaseCreateData = await atomicLeaseCreate({
        property: new ObjectId(property), chamber: new ObjectId(chamber), cancelable,
        created_by, created_at, start_at, end_at, rent, surety, deposit, tenant, enable,
        commercial, canceled, updatable, deletable, description, leasePeriod, rentPeriod,
    });
    if(!atomicLeaseCreateData.status) {
        return atomicLeaseCreateData;
    }

    const createdLeaseId = atomicLeaseCreateData.data;

    // Generate invoice & payment for surety
    if(surety > 0) {
        const suretyAmount = surety * rent;
        const reference = `Caution sur contract de bail de reference ${createdLeaseId}`;
        await invoicesHelpers.createInvoice({
            withPayment: true,
            type: generalConstants.TYPES.INVOICE.SURETY,
            lease: createdLeaseId, amount: suretyAmount,
            tenant, chamber, property, creator, reference,
        });
    }

    // Generate invoice & payment for deposit
    if(deposit > 0) {
        const depositAmount = deposit * rent;
        const reference = `Avance sur loyer sur contract de bail de reference ${createdLeaseId}`;
        await invoicesHelpers.createInvoice({
            withPayment: true,
            type: generalConstants.TYPES.INVOICE.RENT,
            lease: createdLeaseId, amount: depositAmount,
            tenant, chamber, property,creator, reference,
        });
        // Update tenant balance
        await usersHelpers.updateTenantBalance({username: tenant, balance: depositAmount});
    }

    // Date config
    const isLeapYear = require('dayjs/plugin/isLeapYear');
    const isoWeeksInYear = require('dayjs/plugin/isoWeeksInYear');
    dayjs.extend(isLeapYear);
    dayjs.extend(isoWeeksInYear);

    // Generate rents
    let rentsNumber;
    const start = dayjs(leaseStartDate).startOf("day");
    const end = dayjs(leaseStartDate).add(1, leasePeriod).endOf("day");

    if(leasePeriod === rentPeriod) rentsNumber = 1;
    else rentsNumber = end.diff(start, rentPeriod);

    for(let i = 1; i <= rentsNumber; i++) {
        await rentsHelpers.createRent({
            tenant, chamber, property, creator,
            lease: createdLeaseId, amount: rent,
            start: start.add(i - 1, rentPeriod).toDate(),
            end: end.subtract(rentsNumber + i - 1, rentPeriod).toDate(),
        });
    }

    // Occupy chamber & property occupation
    await chambersHelpers.occupiedChamberByChamberId(chamber, property);

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
        atomicLeasesFetchData.forEach(item => data.push(new LeaseModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic lease update into database
const atomicLeaseUpdate = async (filter, update) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicLeaseUpdateData = await client.db().collection(leasesCollection).updateOne(filter, update);
        // Format response
        if(atomicLeaseUpdateData.acknowledged) {
            if(atomicLeaseUpdateData.modifiedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.LEASES.LEASE_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic lease fetch into database
const atomicLeaseFetch = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicLeaseFetchData = await client.db().collection(leasesCollection).findOne(filter);
        // Format response
        if(atomicLeaseFetchData !== null) {
            status = true;
            data = new LeaseModel(atomicLeaseFetchData);
        }
        else message = errorConstants.LEASES.LEASE_NOT_FOUND;
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
