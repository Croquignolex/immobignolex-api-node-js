const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const usersHelpers = require('../mongodb/usersHelpers');
const leasesHelpers = require('../mongodb/leasesHelpers');
const envConstants = require('../../constants/envConstants');
const chambersHelpers = require('../mongodb/chambersHelpers');
const paymentsHelpers = require('../mongodb/paymentsHelpers');
const errorConstants = require('../../constants/errorConstants');
const propertiesHelpers = require('../mongodb/propertiesHelpers');

// Data
const invoicesCollection = "invoices";
const databaseUrl = envConstants.DATABASE_URL;

// Create invoice
module.exports.createInvoice = async ({amount, tenant, chamber, property, lease, reference, creator, withPayment = false}) => {
    // Data
    const advance = false;
    const canceled = false;
    const updatable = false;
    const deletable = false;
    const payed = withPayment;
    const created_by = creator;
    const created_at = new Date();
    const cancelable = withPayment;

    // Keep into database
    const atomicInvoiceCreateData = await atomicInvoiceCreate({
        payed, advance, deletable, updatable, canceled,
        created_by, created_at, amount, tenant, reference, cancelable,
        property: new ObjectId(property), chamber: new ObjectId(chamber), lease: new ObjectId(lease),
    });
    if(!atomicInvoiceCreateData.status) {
        return atomicInvoiceCreateData;
    }

    // Push property, chamber & tenant invoice
    const createdInvoiceId = atomicInvoiceCreateData.data;
    await leasesHelpers.addLeaseInvoiceByLeaseId(lease, createdInvoiceId);
    await chambersHelpers.addChamberInvoiceByChamberId(chamber, createdInvoiceId);
    await usersHelpers.addTenantInvoiceByTenantUsername(tenant, createdInvoiceId);
    await propertiesHelpers.addPropertyInvoiceByPropertyId(property, createdInvoiceId);

    if(withPayment) {
        // Create payment
        await paymentsHelpers.createPayment({
            amount, tenant, chamber, property, lease, reference, creator
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
