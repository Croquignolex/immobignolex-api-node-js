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
