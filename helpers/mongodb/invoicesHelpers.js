const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const paymentsHelpers = require('../mongodb/paymentsHelpers');
const errorConstants = require('../../constants/errorConstants');

// Data
const invoicesCollection = "invoices";
const databaseUrl = envConstants.DATABASE_URL;

// Create invoice
module.exports.createInvoice = async ({type, amount, tenant, chamber, property, lease,
                                          reference, creator, withPayment = false}) => {
    // Data
    const advance = false;
    const canceled = false;
    const updatable = false;
    const deletable = false;
    const payed = withPayment;
    const created_by = creator;
    const created_at = new Date();
    const cancelable = !withPayment;

    // Keep into database
    const atomicInvoiceCreateData = await atomicInvoiceCreate({
        type, payed, advance, deletable, updatable, canceled,
        created_by, created_at, amount, tenant, reference, cancelable,
        property: new ObjectId(property), chamber: new ObjectId(chamber), lease: new ObjectId(lease),
    });
    if(!atomicInvoiceCreateData.status) {
        return atomicInvoiceCreateData;
    }

    if(withPayment) {
        // Create payment
        const createdInvoiceId = atomicInvoiceCreateData.data;
        await paymentsHelpers.createPayment({
            amount, tenant, chamber, property, lease, reference, creator, invoice: createdInvoiceId
        });
    }

    return atomicInvoiceCreateData;
};

// Atomic invoice create into database
const atomicInvoiceCreate = async (document) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicInvoiceCreateData = await client.db().collection(invoicesCollection).insertOne(document);
        // Format response
        if(atomicInvoiceCreateData.acknowledged) {
            data = atomicInvoiceCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.INVOICES.INVOICE_CREATE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
