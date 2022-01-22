const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const usersHelpers = require('../mongodb/usersHelpers');
const leasesHelpers = require('../mongodb/leasesHelpers');
const envConstants = require('../../constants/envConstants');
const chambersHelpers = require('../mongodb/chambersHelpers');
const errorConstants = require('../../constants/errorConstants');
const propertiesHelpers = require('../mongodb/propertiesHelpers');

// Data
const paymentsCollection = "payments";
const databaseUrl = envConstants.DATABASE_URL;

// Create payment
module.exports.createPayment = async ({amount, tenant, chamber, property, lease, reference, creator}) => {
    // Data
    const canceled = false;
    const updatable = false;
    const deletable = false;
    const cancelable = false;
    const created_by = creator;
    const created_at = new Date();

    // Keep into database
    const atomicPaymentCreateData = await atomicPaymentCreate({
        cancelable, deletable, updatable, canceled,
        created_by, created_at, amount, tenant, reference,
        property: new ObjectId(property), chamber: new ObjectId(chamber), lease: new ObjectId(lease),
    });
    if(!atomicPaymentCreateData.status) {
        return atomicPaymentCreateData;
    }

    // Push property, chamber & tenant payment
    const createdPaymentId = atomicPaymentCreateData.data;
    await leasesHelpers.addLeasePaymentsByLeaseId(lease, createdPaymentId);
    await chambersHelpers.addChamberPaymentByChamberId(chamber, createdPaymentId);
    await usersHelpers.addTenantPaymentByTenantUsername(tenant, createdPaymentId);
    await propertiesHelpers.addPropertyPaymentByPropertyId(property, createdPaymentId);

    return atomicPaymentCreateData;
};

// Atomic payment create into database
const atomicPaymentCreate = async (document) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPaymentCreateData = await client.db().collection(paymentsCollection).insertOne(document);
        // Format response
        if(atomicPaymentCreateData.acknowledged) {
            data = atomicPaymentCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.PAYMENTS.PAYMENT_CREATE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
