const envConstants = require("../constants/envConstants");
const generalHelpers = require("../helpers/generalHelpers");

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

// Extract avatar from the correct env
module.exports.filePublicUrl = (file) => {
    if(!file) return null;
    return (envConstants.APP.ENVIRONMENT === "local") ? file.url : file.secure;
};

// Remove a file from path
module.exports.deleteFileFromPath = (path) => {
    return new Promise((resolve) => {
        const fs = require('fs');
        fs.unlink(path, (err) => {
            if (err) {
                generalHelpers.log("File delete error", err);
                resolve({status: false, message: "", data: null});
            }
            resolve({status: true, message: "", data: null});
        })
    });
};

// Extract pictures from the correct env
module.exports.picturesPublicUrl = (pictures) => {
    if(!pictures || pictures?.length === 0) return [];

    const extractedPictures = [];
    pictures.forEach((picture) => extractedPictures.push(picturePublicUrl(picture)));
    return extractedPictures;
};

// Extract pictures from the correct env
module.exports.arrayToString = (tab, separator = ", ") => {
    if(!tab || tab?.length === 0) return null;

    return tab.join(separator);
};

// Get database lookup unwind
module.exports.databaseUnwind = (column) => {
    return {
        $unwind: {
            path: column,
            preserveNullAndEmptyArrays: true
        }
    };
};

// Find period types rank
module.exports.periodsTypesRank = (period) => {
    const found = periodsTypes.find((item) => item.value === period);
    return found ? found.rank : found;
};

// Get available app period type
const periodsTypes = () => {
    return [
        {rank: 0, value: "day"},
        {rank: 1, value: "week"},
        {rank: 2, value: "month"},
        {rank: 3,  value: "year"},
    ];
};

// Extract picture from the correct env
const picturePublicUrl = (picture) => {
    return (
        (envConstants.APP.ENVIRONMENT === "local")
            ? {id: picture.id, src: picture.url}
            : {id: picture.id, src: picture.secure}
    );
};

module.exports.picturePublicUrl = picturePublicUrl;

