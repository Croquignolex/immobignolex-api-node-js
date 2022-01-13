const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");

// Data
const invoicesCollection = "invoices";
const databaseUrl = envConstants.DATABASE_URL;

// Create chamber
module.exports.createInvoice = async ({amount, tenant, chamber, property, description, creator}) => {
    // Data
    const enable = true;
    const created_by = creator;
    const created_at = new Date();

    // Keep into database
    const atomicInvoiceCreateData = await atomicInvoiceCreate({
        created_by, created_at, amount: parseInt(amount, 10) || 0, enable, description,
        property: new ObjectId(property), tenant: new ObjectId(tenant), chamber: new ObjectId(chamber),
    });
    if(!atomicInvoiceCreateData.status) {
        return atomicInvoiceCreateData;
    }

    // Push property chamber
    const createdInvoiceId = atomicInvoiceCreateData.data;
    return await propertiesHelpers.addPropertyChamberByPropertyId(property, createdChamberId, false);

    return atomicInvoiceCreateData;
};

// Atomic invoice create into database
const atomicInvoiceCreate = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicInvoiceCreateData = await client.db().collection(invoicesCollection).insertOne(directives);
        // Format response
        if(atomicInvoiceCreateData.acknowledged && atomicInvoiceCreateData.insertedId) {
            data = atomicInvoiceCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.LEASES.CREATE_LEASE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
