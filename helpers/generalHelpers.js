const envConstants = require("../constants/envConstants");

module.exports.log = (message, data = null, highPriority = false) => {
    // Only in local environment
    if (envConstants.APP.LOGGER === "console" || highPriority) {
        console.log(Array(60).fill("#").join(""));
        console.log("IMMOBIGNOLEX API");
        console.log(`Message: ${message}`);
        data && console.log({data});
    }
};

// Generate a random image file name
module.exports.generateRandomString = (length = 32) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

// Build JWT token
module.exports.buildJwtToken = (willExpire = true, payload = {}) => {
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

    if(willExpire) {
        options.expiresIn = envConstants.JWT.EXPIRE;
    }

    // Create the JWT Token
    return jwt.sign(payload, privateKey, options);
};
