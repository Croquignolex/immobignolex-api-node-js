const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const PaymentModel = require("../../models/paymentModel");
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const generalConstants = require("../../constants/generalConstants");

// Data
const paymentsCollection = "payments";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all payments with chamber, property, tenant, lease, rent into database
module.exports.paymentsWithChamberAndPropertyAndTenantAndLeaseAndRent = async () => {
    return await embeddedPaymentsFetch([
        generalConstants.LOOP_DIRECTIVE.BUILDING,
        generalHelpers.databaseUnwind("$building"),
        generalConstants.LOOP_DIRECTIVE.UNIT,
        generalHelpers.databaseUnwind("$unit"),
        generalConstants.LOOP_DIRECTIVE.TAKER,
        generalHelpers.databaseUnwind("$taker"),
        generalConstants.LOOP_DIRECTIVE.CONTRACT,
        generalHelpers.databaseUnwind("$contract"),
        generalConstants.LOOP_DIRECTIVE.RENTAL,
        generalHelpers.databaseUnwind("$rental"),
    ]);
};

// Fetch payment by id with chamber, property, tenant, lease, rent, creator into database
module.exports.paymentByIdWithChamberAndPropertyAndTenantAndLeaseAndRentAndCreator = async (id) => {
    // Data
    const _id = new ObjectId(id);

    // Database fetch
    return await embeddedPaymentFetch([
        generalConstants.LOOP_DIRECTIVE.BUILDING,
        generalHelpers.databaseUnwind("$building"),
        generalConstants.LOOP_DIRECTIVE.UNIT,
        generalHelpers.databaseUnwind("$unit"),
        generalConstants.LOOP_DIRECTIVE.TAKER,
        generalHelpers.databaseUnwind("$taker"),
        generalConstants.LOOP_DIRECTIVE.CONTRACT,
        generalHelpers.databaseUnwind("$contract"),
        generalConstants.LOOP_DIRECTIVE.RENTAL,
        generalHelpers.databaseUnwind("$rental"),
        generalConstants.LOOP_DIRECTIVE.CREATOR,
        generalHelpers.databaseUnwind("$creator"),
        { $match : {_id} }
    ]);
};

// Create payment
module.exports.createPayment = async ({type, amount, quantity, payed_at, tenant, chamber, property, lease, rent, description, creator}) => {
    // Data
    const canceled = false;
    const updatable = false;
    const deletable = false;
    const cancelable = !!rent;
    const created_by = creator;
    const created_at = new Date();
    const reference = "PAYMENT" + created_at?.getTime();

    // Keep into database
    return await atomicPaymentCreate({
        rent: rent ? new ObjectId(rent): null,
        quantity, type, amount, cancelable, deletable, updatable, canceled,
        created_by, created_at, payed_at, cancel_at: null, tenant, reference, description,
        lease: new ObjectId(lease), property: new ObjectId(property), chamber: new ObjectId(chamber),
    });
};

// Embedded payments fetch into database
const embeddedPaymentsFetch = async (pipeline) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedPaymentsFetchData = await client.db().collection(paymentsCollection)
            .aggregate(pipeline)
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        embeddedPaymentsFetchData.forEach(item => data.push(new PaymentModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Embedded payment fetch into database
const embeddedPaymentFetch = async (pipeline) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedPaymentFetchData = await client.db().collection(paymentsCollection)
            .aggregate(pipeline)
            .toArray();
        // Format response
        if(embeddedPaymentFetchData.length > 0) {
            status = true;
            data = new PaymentModel(embeddedPaymentFetchData[0]).responseFormat;
        }
        else message = errorConstants.PAYMENTS.PAYMENT_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
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
