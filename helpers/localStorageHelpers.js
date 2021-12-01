const storage = require('node-persist');

const generalHelpers = require('./generalHelpers')

// Set local storage item
module.exports.setLocaleStorageItem = async (key, value) => {
    try {
        await storage.init();
        await storage.setItem(key, value);
        return true;
    } catch (e) {
        generalHelpers.log("Set local storage item error", e);
    }
    return false;
};

// Get local storage item
module.exports.getLocaleStorageItem = async (key) => {
    let data;
    try {
        await storage.init();
        data = await storage.getItem(key);
    } catch (e) {
        generalHelpers.log("Get local storage item error", e);
    }
    return data;
};

// Remove local storage item
module.exports.removeLocaleStorageItem = async (key) => {
    try {
        await storage.init();
        await storage.removeItem(key);
        return true;
    } catch (e) {
        generalHelpers.log("Remove local storage item error", e);
    }
    return false;
};