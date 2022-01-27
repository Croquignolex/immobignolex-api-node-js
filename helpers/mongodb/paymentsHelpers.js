const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const paymentsCollection = "payments";
const databaseUrl = envConstants.DATABASE_URL;

// Create payment
module.exports.createPayment = async ({type, amount, tenant, chamber, property, lease, rent, description, creator}) => {
    // Data
    const canceled = false;
    const updatable = false;
    const deletable = false;
    const cancelable = true;
    const created_by = creator;
    const created_at = new Date();
    const reference = "PAYMENT" + created_at?.getTime();

    // Keep into database
    return await atomicPaymentCreate({
        rent: rent ? new ObjectId(rent): null,
        type, cancelable, deletable, updatable,
        canceled, created_by, created_at, amount, tenant, reference, description,
        lease: new ObjectId(lease), property: new ObjectId(property), chamber: new ObjectId(chamber),
    });
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
