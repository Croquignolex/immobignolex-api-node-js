const {MongoClient} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const CompanyModel = require('../../models/companyModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const companyCollection = "company";
const databaseUrl = envConstants.DATABASE_URL;

// Get company
module.exports.company = async () => {
    return await atomicCompanyFetch();
};

// Update company avatar
module.exports.updateCompanyLogo = async (logo) => {
    return await atomicCompanyUpdate({$set: {logo}});
};

// Update company info
module.exports.updateCompanyInfo = async ({name, owner, address, phone, email,
                                              accountBank, accountName, accountNumber, accountIban}) => {
    return await atomicCompanyUpdate(
        {$set: {name, owner, address, phone, email, accountBank, accountName, accountNumber, accountIban}}
    );
};

// Atomic only company fetch into database
const atomicCompanyFetch = async () => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicCompanyFetchData = await client.db().collection(companyCollection).findOne();
        // Format response
        if(atomicCompanyFetchData !== null) {
            status = true;
            data = new CompanyModel(atomicCompanyFetchData);
        }
        else message = errorConstants.COMAPNY.COMPANY_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic only company update into database
const atomicCompanyUpdate = async (update) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicCompanyUpdateData = await client.db().collection(companyCollection).updateOne({}, update);
        // Format response
        if(atomicCompanyUpdateData.acknowledged) {
            if(atomicCompanyUpdateData.modifiedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.COMAPNY.COMPANY_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
