const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const ChamberModel = require('../../models/chamberModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');
const generalConstants = require("../../constants/generalConstants");
const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");

// Data
const chambersCollection = "chambers";
const propertiesCollection = "properties";
const databaseUrl = envConstants.DATABASE_URL;
const chamberPropertyLookup = {
    $lookup: {
        from: propertiesCollection,
        localField: "property",
        foreignField: "_id",
        as: "building"
    }
};

// Fetch all chambers with property into database
module.exports.chambersWithProperty = async () => {
    return await embeddedChambersFetch([
        chamberPropertyLookup,
        generalHelpers.databaseUnwind("$building")
    ]);
};

// Fetch chamber by id with property & creator into database
module.exports.chamberByIdWithPropertyAndCreator = async (id) => {
    // Data
    const _id = new ObjectId(id);

    // Database fetch
    return await embeddedChamberFetch([
        chamberPropertyLookup,
        generalHelpers.databaseUnwind("$building"),
        generalConstants.LOOP_DIRECTIVE.CREATOR,
        generalHelpers.databaseUnwind("$creator"),
        { $match : {_id} }
    ]);
};

// Fetch chamber by id into database
module.exports.chamberById = async (id) => {
    return await atomicChamberFetch({_id: new ObjectId(id)});
};

// Fetch all property chambers into database
module.exports.propertyChambers = async (property) => {
    return await atomicChambersFetch({property: new ObjectId(property)});
};

// Check if property has chamber into database
module.exports.propertyHasChamber = async (property, chamber) => {
    return await atomicChamberFetch({_id: new ObjectId(chamber), property: new ObjectId(property)});
};

// Fetch all property free chambers into database
module.exports.propertyFreeChambers = async (property) => {
    return await atomicChambersFetch({occupied: false, property: new ObjectId(property)});
};

// Create chamber
module.exports.createChamber = async ({name, phone, rent, type, property, description, creator}) => {
    // Data
    const occupied = false;
    const updatable = true;
    const deletable = true;
    const created_by = creator;
    const created_at = new Date();

    // Keep into database
    const atomicChamberCreateData = await atomicChamberCreate({
        name, phone, rent, type,
        updatable, deletable, occupied,
        property: new ObjectId(property),
        description, created_by, created_at
    });
    if(!atomicChamberCreateData.status) {
        return atomicChamberCreateData;
    }

    // Push property chambers & update occupation
    const createdChamberId = atomicChamberCreateData.data;
    await propertiesHelpers.addPropertyChamberByPropertyId(property, createdChamberId);

    return atomicChamberCreateData;
};

// Update chamber
module.exports.updateChamber = async ({id, name, phone, rent, type, property, description}) => {
    //Data
    const _id = new ObjectId(id);

    // Updatable check & fetch
    const atomicChamberFetchData = await atomicChamberFetch({_id});
    if(!atomicChamberFetchData.status) {
        return atomicChamberFetchData
    }

    // Update chamber info
    const atomicChamberUpdateData = await atomicChamberUpdate(
        {_id, updatable: true},
        {$set: {name, phone, rent, description, type, property: new ObjectId(property)}}
    );
    if(!atomicChamberUpdateData.status) {
        return atomicChamberUpdateData;
    }

    // Old and new property management
    const oldProperty = atomicChamberFetchData.data.property;
    if(oldProperty !== property) {
        // Remove old chamber property id different from new property
        await propertiesHelpers.removePropertyChamberByPropertyId(oldProperty, id);
        // Add new chamber property id different from new property
        await propertiesHelpers.addPropertyChamberByPropertyId(property, id);
    }

    return atomicChamberUpdateData;
};

// Delete chamber
module.exports.deleteChamberByChamberId = async (id) => {
    //Data
    const _id = new ObjectId(id);

    // Deletable check & fetch
    const atomicChamberFetchData = await atomicChamberFetch({_id});
    if(!atomicChamberFetchData.status) {
        return atomicChamberFetchData
    }

    // Delete chamber info
    const atomicChamberDeleteData = await atomicChamberDelete({_id: new ObjectId(id), deletable: true});
    if(!atomicChamberDeleteData.status) {
        return atomicChamberDeleteData;
    }

    // Old and new property management
    const oldProperty = atomicChamberFetchData.data.property;
    if(oldProperty) {
        // Remove old chamber property id different from new property
        await propertiesHelpers.removePropertyChamberByPropertyId(oldProperty, id);
    }

    return atomicChamberDeleteData;
};

// Add chamber good by chamber id
module.exports.addChamberGoodByChamberId = async (id, goodId) => {
    return await atomicChamberUpdate(
        {_id: new ObjectId(id)},
        {
            $addToSet: {goods: new ObjectId(goodId)},
            $set: {deletable: false}
        }
    );
};

// Add chamber invoice by chamber id
module.exports.addChamberInvoiceByChamberId = async (id, invoiceId) => {
    return await atomicChamberUpdate(
        {_id: new ObjectId(id)},
        {
            $addToSet: {invoices: new ObjectId(invoiceId)},
            $set: {deletable: false, updatable: false}
        }
    );
};

// Add chamber payment by chamber id
module.exports.addChamberPaymentByChamberId = async (id, paymentId) => {
    return await atomicChamberUpdate(
        {_id: new ObjectId(id)},
        {
            $addToSet: {payments: new ObjectId(paymentId)},
            $set: {deletable: false, updatable: false}
        }
    );
};

// Add chamber rent by chamber id
module.exports.addChamberRentByChamberId = async (id, rentId) => {
    return await atomicChamberUpdate(
        {_id: new ObjectId(id)},
        {
            $addToSet: {rents: new ObjectId(rentId)},
            $set: {deletable: false, updatable: false}
        }
    );
};

// Remove chamber good by chamber id
module.exports.removeChamberGoodByChamberId = async (id, goodId) => {
    // Data
    const _id = new ObjectId(id);

    //
    const atomicChamberFetchData = await atomicChamberFetch({_id});
    if(atomicChamberFetchData.status) {
        const chamberData = atomicChamberFetchData.data?.simpleResponseFormat;
        const goods = chamberData.goods - 1;
        const deletable = (goods === 0);
        const updatable = (goods === 0) ? true : chamberData.updatable;
        return await atomicChamberUpdate(
            {_id},
            {
                $pull: {goods: new ObjectId(goodId)},
                $set: {deletable, updatable}
            }
        );
    }
    return atomicChamberFetchData;
};

// Add chamber picture by chamber id
module.exports.addChamberPictureByChamberId = async (id, picture) => {
    return await atomicChamberUpdate({_id: new ObjectId(id)}, {$push: {pictures: picture}});
};

// Remove chamber picture by chamber id
module.exports.removeChamberPictureByChamberId = async (id, pictureId) => {
    return await atomicChamberUpdate({_id: new ObjectId(id)}, {$pull: {pictures: {id: pictureId}}});
};

// Embedded chambers fetch into database
const embeddedChambersFetch = async (pipeline) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedChambersFetchData = await client.db().collection(chambersCollection)
            .aggregate(pipeline)
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        embeddedChambersFetchData.forEach(item => data.push(new ChamberModel(item).simpleResponseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Embedded chamber fetch into database
const embeddedChamberFetch = async (pipeline) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedChamberFetchData = await client.db().collection(chambersCollection)
            .aggregate(pipeline)
            .toArray();
        // Format response
        if(embeddedChamberFetchData.length > 0) {
            status = true;
            data = new ChamberModel(embeddedChamberFetchData[0]).responseFormat;
        }
        else message = errorConstants.CHAMBERS.CHAMBER_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic chambers fetch into database
const atomicChambersFetch = async (filter) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicChambersFetchData = await client.db().collection(chambersCollection)
            .find(filter || {})
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        atomicChambersFetchData.forEach(item => data.push(new ChamberModel(item).simpleResponseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic chamber fetch into database
const atomicChamberFetch = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicChamberFetchData = await client.db().collection(chambersCollection).findOne(filter);
        // Format response
        if(atomicChamberFetchData !== null) {
            status = true;
            data = new ChamberModel(atomicChamberFetchData);
        }
        else message = errorConstants.CHAMBERS.CHAMBER_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic chamber create into database
const atomicChamberCreate = async (document) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicChamberCreateData = await client.db().collection(chambersCollection).insertOne(document);
        // Format response
        if(atomicChamberCreateData.acknowledged) {
            data = atomicChamberCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.CHAMBERS.CHAMBER_CREATE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic chamber update into database
const atomicChamberUpdate = async (filter, update) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicChamberUpdateData = await client.db().collection(chambersCollection).updateOne(filter, update);
        // Format response
        if(atomicChamberUpdateData.acknowledged) {
            if(atomicChamberUpdateData.modifiedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.CHAMBERS.CHAMBER_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic chamber delete into database
const atomicChamberDelete = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicChamberDeleteData = await client.db().collection(chambersCollection).deleteOne(filter);
        // Format response
        if(atomicChamberDeleteData.acknowledged) {
            if(atomicChamberDeleteData.deletedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.CHAMBERS.CHAMBER_DELETE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

