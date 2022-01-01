const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const GoodModel = require('../../models/goodModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const chambersHelpers = require("../../helpers/mongodb/chambersHelpers");

// Data
const goodsCollection = "goods";
const databaseUrl = envConstants.DATABASE_URL;

// Add good picture by good id
module.exports.addGoodPictureByGoodId = async (id, picture) => {
    return await atomicGoodUpdate(id, {$push: {pictures: picture}});
};

// Remove good picture by good id
module.exports.removeGoodPictureByGoodId = async (id, pictureId) => {
    return await atomicGoodUpdate(id, {$pull: {pictures: {id: pictureId}}});
};

// Simple archive good
module.exports.simpleArchiveGoodByGoodId = async (id) => {
    // TODO: Implement archive procedures

    return await atomicGoodUpdate(id, {$set: {enable: false}});
}

// Archive good
module.exports.archiveGoodByGoodId = async (id) => {
    // TODO: Implement archive procedures

    // Data
    const _id = new ObjectId(id);

    // Fetch good
    const atomicGoodFetchData = await atomicGoodFetch({_id});
    if(!atomicGoodFetchData.status) {
        return atomicGoodFetchData;
    }

    // Remove chamber good
    const chamber = atomicGoodFetchData.data.chamber;
    if(chamber) {
        const removeChamberGoodByChamberIdData = await chambersHelpers.removeChamberGoodByChamberId(chamber, _id);
        if(!removeChamberGoodByChamberIdData.status) {
            return removeChamberGoodByChamberIdData;
        }
    }

    return await atomicGoodUpdate(id, {$set: {enable: false, chamber: null}});
};

// Atomic good fetch into database
const atomicGoodFetch = async (directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicGoodFetchData = await client.db().collection(goodsCollection).findOne(directives);
        // Format response
        if(atomicGoodFetchData !== null) {
            status = true;
            data = new GoodModel(atomicGoodFetchData);
        }
        else message = errorConstants.GOODS.GOOD_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic good update into database
const atomicGoodUpdate = async (id, directives) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        const _id = new ObjectId(id);
        // Query
        const atomicGoodUpdateData = await client.db().collection(goodsCollection).updateOne(
            {_id}, directives
        );
        // Format response
        if(atomicGoodUpdateData.matchedCount === 1 && atomicGoodUpdateData.modifiedCount === 0) {
            message = errorConstants.GENERAL.NO_CHANGES;
        }
        else if(atomicGoodUpdateData.modifiedCount === 1) status = true;
        else message = errorConstants.GOODS.GOOD_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
