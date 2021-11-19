const envConstants = require("../constants/envConstants");
const generalConstants = require("../constants/generalConstants");
const localStorageHelpers = require("../helpers/localStorageHelpers");

module.exports.log = (message, data = null, highPriority = false) => {
    // Only in local environment
    if (envConstants.APP.LOGGER === "console" || highPriority) {
        console.log(Array(60).fill("#").join(""));
        console.log("IMMOBIGNOLEX AUTH SERVICE");
        console.log(`Message: ${message}`);
        data && console.log({data});
    }
};

// Spawn token for services request
module.exports.spawnRequestToken = async (refresh = false) => {
    const localStorageToken = await localStorageHelpers.getLocaleStorageItem("token");
    if((!localStorageToken && !refresh) || refresh) {
        // Build token if not existing into local storage
        const fs = require('fs');
        const jwt = require('jsonwebtoken');

        // Read public key
        const privateKey = fs.readFileSync("private.key", "utf8");

        // Build verification options
        const options = {
            algorithm: "RS256",
            issuer: envConstants.JWT.ISSUER,
            subject: envConstants.JWT.SUBJECT,
            audience: envConstants.JWT.AUDIENCE
        }

        options.expiresIn = envConstants.JWT.EXPIRE;

        // Create the JWT Token
        const jwtToken =  jwt.sign({permissions: [generalConstants.ROLES.SERVICE]}, privateKey, options);

        await localStorageHelpers.setLocaleStorageItem("token", jwtToken);
        return jwtToken;
    }
    return localStorageToken;
};
