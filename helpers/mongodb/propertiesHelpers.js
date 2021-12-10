const {MongoClient} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const PropertyModel = require('../../models/propertyModel');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const usersCollection = "users";
const propertiesCollection = "properties";
const databaseUrl = envConstants.DATABASE_URL;

// Fetch all properties into database
module.exports.properties = async () => {
    // Connection configuration
    let client, data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);
    try {
        // mongodb query execution
        await client.connect()
        const dbData = await client.db().collection(propertiesCollection)
            .aggregate([{
                $lookup: {
                    from: usersCollection,
                    localField: "caretaker",
                    foreignField: "_id",
                    as: "manager"
                }
            }])
            .toArray();
        data = [];
        status = true;
        dbData.forEach(item => data.push(new PropertyModel(item)));
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client.close(); }
    return {data, status, message};
};
