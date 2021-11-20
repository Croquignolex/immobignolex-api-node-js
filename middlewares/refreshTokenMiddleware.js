const fs = require("fs");
const jwt = require("jsonwebtoken");

const envConstants = require("../constants/envConstants");
const generalHelpers = require("../helpers/generalHelpers");

module.exports = (req, res, next) => {
    // Check token existence
    const bearToken = req.header("passport");
    if(!bearToken) res.status(400).json({status: false, message: "", data: null});

    try {
        // Read public key
        const publicKey = fs.readFileSync("public.key", "utf8");

        // Build verification options
        const options = {
            algorithms: ["RS256"],
            issuer: envConstants.JWT.ISSUER,
            subject: envConstants.JWT.SUBJECT,
            audience: envConstants.JWT.AUDIENCE
        }

        // Verify bear token in header
        const token = bearToken.split(' ')[1];
        jwt.verify(token, publicKey, options);
        const decoded = jwt.decode(token, {complete: true});
        req.username = decoded.payload.username;
        req.token = token;
        next();
    } catch (e) {
        generalHelpers.log("Refresh token verification error", e);
        res.status(400).json({status: false, message: "", data: null});
    }
};
