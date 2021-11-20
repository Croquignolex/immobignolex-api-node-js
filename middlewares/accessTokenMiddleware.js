const fs = require("fs");
const jwt = require("jsonwebtoken");

const envConstants = require("../constants/envConstants");
const generalHelpers = require("../helpers/generalHelpers");
const errorConstants = require("../constants/errorConstants");

module.exports = (req, res, next) => {
    // Check token existence
    const bearToken = req.header("authorization");
    if(!bearToken) return res.status(401).json({
        data: null,
        status: false,
        message: errorConstants.MIDDLEWARE.UNAUTHORIZED_REQUEST
    });

    try {
        // Read public key
        const publicKey = fs.readFileSync("public.key", "utf8");

        // Build verification options
        const options = {
            algorithms: ["RS256"],
            maxAge: envConstants.JWT.EXPIRE,
            issuer: envConstants.JWT.ISSUER,
            subject: envConstants.JWT.SUBJECT,
            audience: envConstants.JWT.AUDIENCE
        }

        // Verify bear token in header
        const token = bearToken.split(' ')[1];
        jwt.verify(token, publicKey, options);
        const decoded = jwt.decode(token, {complete: true});
        req.username = decoded.payload.username;
        req.permissions = decoded.payload.permissions;
        next();
    } catch (e) {
        generalHelpers.log("Token verification error", e);
        res.status(406).json({status: false, message: errorConstants.MIDDLEWARE.INVALID_TOKEN, data: null});
    }
};
