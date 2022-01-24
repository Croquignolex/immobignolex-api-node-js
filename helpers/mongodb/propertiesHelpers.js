const {MongoClient, ObjectId} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const PropertyModel = require('../../models/propertyModel');
const envConstants = require('../../constants/envConstants');
const chambersHelpers = require('../mongodb/chambersHelpers');
const errorConstants = require('../../constants/errorConstants');
const generalConstants = require('../../constants/generalConstants');

// Data
const propertiesCollection = "properties";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all properties into database
module.exports.properties = async () => {
    return await atomicPropertiesFetch();
};

// Fetch property by id into database
module.exports.propertyById = async (id) => {
    return await atomicPropertyFetch({_id: new ObjectId(id)});
};

// Fetch property by id with creator into database
module.exports.propertyByIdWithCreator = async (id) => {
    return await embeddedPropertyFetch([
        generalConstants.LOOP_DIRECTIVE.CREATOR,
        generalHelpers.databaseUnwind("$creator"),
        { $match : {_id: new ObjectId(id)} }
    ]);
};

// Create property
module.exports.createProperty = async ({name, phone, address, description, creator}) => {
    // Data
    const updatable = true;
    const deletable = true;
    const created_by = creator;
    const occupied_chambers = 0;
    const occupied_percentage = 0;
    const created_at = new Date();

    // Keep into database
    return await atomicPropertyCreate({
        name, phone, address, updatable, deletable,
        occupied_percentage, occupied_chambers,
        description, created_by, created_at
    });
};

// Update property
module.exports.updateProperty = async ({id, name, phone, address, description}) => {
    return await atomicPropertyUpdate(
        {_id: new ObjectId(id), updatable: true},
        {$set: {name, phone, address, description}}
    );
};

// Add property picture by property id
module.exports.addPropertyPictureByPropertyId = async (id, picture) => {
    return await atomicPropertyUpdate({_id: new ObjectId(id)}, {$push: {pictures: picture}});
};

// Remove property picture by property id
module.exports.removePropertyPictureByPropertyId = async (id, pictureId) => {
    return await atomicPropertyUpdate({_id: new ObjectId(id)}, {$pull: {pictures: {id: pictureId}}});
};

// Add property occupied chamber by property id
module.exports.addPropertyOccupiedChamberByPropertyId = async (id) => {
    // Data
    const _id = new ObjectId(id);

    // Calculate occupation
    const atomicPropertyFetchData = await atomicPropertyFetch({_id});
    if(atomicPropertyFetchData.status) {
        const propertyData = atomicPropertyFetchData.data?.responseFormat;
        const occupiedChambers = propertyData.occupied_chambers + 1;
        const occupiedPercentage = Math.round((occupiedChambers * 100) / propertyData.chambers);
        return await atomicPropertyUpdate(
            {_id},
            {
                $set: {
                    occupied_percentage: occupiedPercentage,
                    deletable: false,
                    updatable: false
                }
            }
        );
    }
    return atomicPropertyFetchData;
};

// Update property occupation by property id
module.exports.updatePropertyOccupation = async (id) => {
    // Data
    const _id = new ObjectId(id);
    const atomicPropertyFetchData = await atomicPropertyFetch({_id});
    const propertyChambersData = await chambersHelpers.propertyChambers(id);
    if(atomicPropertyFetchData.status) {
        if(propertyChambersData.status) {
            let occupiedChambers = 0;
            const propertyChambers = propertyChambersData.data;
            propertyChambers.forEach((property) => {
                if(property.occupied) {
                    occupiedChambers++;
                }
            });
            const occupiedPercentage = Math.round((occupiedChambers * 100) / propertyChambers);
            const deletable = propertyChambers.length === 0;
            const updatable = occupiedChambers === 0;
            // Update property
            return await atomicPropertyUpdate(
                {_id},
                {
                    $set: {
                        occupied_percentage: occupiedPercentage,
                        deletable,
                        updatable
                    }
                }
            );
        }
        return propertyChambersData;
    }
    return atomicPropertyFetchData;
};

// Add property chamber by property id
module.exports.addPropertyChamberByPropertyId = async (id, chamberId) => {
    // Data
    const _id = new ObjectId(id);

    // Calculate occupation
    const atomicPropertyFetchData = await atomicPropertyFetch({_id});
    if(atomicPropertyFetchData.status) {
        const propertyData = atomicPropertyFetchData.data?.responseFormat;
        const occupiedPercentage = Math.round((propertyData.occupied_chambers * 100) / propertyData.chambers + 1);
        return await atomicPropertyUpdate(
            {_id},
            {
                $addToSet: {chambers: new ObjectId(chamberId)},
                $set: {occupied_percentage: occupiedPercentage, deletable: false}
            }
        );
    }
    return atomicPropertyFetchData;
};

// Remove property chamber by property id
module.exports.removePropertyChamberByPropertyId = async (id, chamberId) => {
    // Data
    const _id = new ObjectId(id);

    // Calculate occupation
    const atomicPropertyFetchData = await atomicPropertyFetch({_id});
    if(atomicPropertyFetchData.status) {
        const propertyData = atomicPropertyFetchData.data?.responseFormat;
        const chambers = propertyData.chambers - 1;
        const deletable = (chambers === 0);
        const updatable = (chambers === 0) ? true : propertyData.updatable;
        const occupiedPercentage = (chambers === 0) ? 0 : Math.round((propertyData.occupied_chambers * 100) / chambers);
        return await atomicPropertyUpdate(
            {_id},
            {
                $pull: {chambers: new ObjectId(chamberId)},
                $set: {occupied_percentage: occupiedPercentage, deletable, updatable}
            }
        );
    }
    return atomicPropertyFetchData;
};

// Delete property
module.exports.deletePropertyByPropertyId = async (id) => {
    return await atomicPropertyDelete({_id: new ObjectId(id), deletable: true});
};

// Embedded property fetch into database
const embeddedPropertyFetch = async (pipeline) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const embeddedPropertyFetchData = await client.db().collection(propertiesCollection)
            .aggregate(pipeline)
            .toArray();
        // Format response
        if(embeddedPropertyFetchData.length > 0) {
            status = true;
            data = new PropertyModel(embeddedPropertyFetchData[0]).responseFormat;
        }
        else message = errorConstants.PROPERTIES.PROPERTY_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic properties fetch into database
const atomicPropertiesFetch = async (filter) => {
    let client, data = null, status = false, message = "";
    // Data
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertiesFetchData = await client.db().collection(propertiesCollection)
            .find(filter || {})
            .sort({created_at: -1})
            .toArray();
        // Format response
        data = [];
        status = true;
        atomicPropertiesFetchData.forEach(item => data.push(new PropertyModel(item).responseFormat));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic property fetch into database
const atomicPropertyFetch = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyFetchData = await client.db().collection(propertiesCollection).findOne(filter);
        // Format response
        if(atomicPropertyFetchData !== null) {
            status = true;
            data = new PropertyModel(atomicPropertyFetchData);
        }
        else message = errorConstants.PROPERTIES.PROPERTY_NOT_FOUND;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic property create into database
const atomicPropertyCreate = async (document) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyCreateData = await client.db().collection(propertiesCollection).insertOne(document);
        // Format response
        if(atomicPropertyCreateData.acknowledged) {
            data = atomicPropertyCreateData.insertedId;
            status = true;
        }
        else message = errorConstants.PROPERTIES.PROPERTY_CREATE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic property update into database
const atomicPropertyUpdate = async (filter, update) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyUpdateData = await client.db().collection(propertiesCollection).updateOne(filter, update);
        // Format response
        if(atomicPropertyUpdateData.acknowledged) {
            if(atomicPropertyUpdateData.modifiedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.PROPERTIES.PROPERTY_UPDATE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

// Atomic property delete into database
const atomicPropertyDelete = async (filter) => {
    // Data
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        await client.connect();
        // Query
        const atomicPropertyDeleteData = await client.db().collection(propertiesCollection).deleteOne(filter);
        // Format response
        if(atomicPropertyDeleteData.acknowledged) {
            if(atomicPropertyDeleteData.deletedCount === 0) message = errorConstants.GENERAL.NO_CHANGES;
            else status = true;
        }
        else message = errorConstants.PROPERTIES.PROPERTY_DELETE;
    } catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};

