const {MongoClient} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const collection = "users";
const document = "immobignolex";
const databaseUrl = envConstants.DATABASE_URL;

module.exports.generateUserTokens = async (user, useragent) => {
    // Connection configuration
    let client, refreshToken = "", data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);

    // Extract user agent data
    const tokens = user?.tokens || [];
    const mobile = useragent?.isMobile;
    const desktop = useragent?.isDesktop;
    const os = useragent?.os.toString();
    const browser = useragent?.browser.toString();
    const version = useragent?.version.toString();

    // Check if user agent is trusted
    const tokenNeedle = tokens.find(token => (
        token?.browser === browser &&
        token?.desktop === desktop &&
        token?.mobile === mobile &&
        token?.os === os
    ));

    // Generate access token
    const accessToken = generalHelpers.buildJwtToken(
        true,
        {username: user.username, permissions: user.roles}
    );

    try {
        // mongodb query execution
        await client.connect()

        // Update user token
        if(tokenNeedle) {
            refreshToken = tokenNeedle.token;
            tokens.map(token => {
                if(
                    token?.browser === browser &&
                    token?.desktop === desktop &&
                    token?.mobile === mobile &&
                    token?.os === os
                ) {
                    token.version = version;
                    // TODO: save miliseconds with days js packge at UTC
                    token.usedAt = "";
                }
                return token;
            });
        }
        // Create user token
        else {
            refreshToken = generalHelpers.buildJwtToken(false, {username: user.user});
            tokens.push({
                browser, version, os, mobile, desktop,
                token: refreshToken,
                // TODO: save miliseconds with days js packge at UTC
                createdAt: "",
                usedAt: ""
            })
        }
        // TODO: save token into database
        // Return tokens
        const dbData = await client.db(document).collection(collection).find() || [];
        if(dbData !== null) {
            status = true;
            data = {access: accessToken, refresh: refreshToken};
        }
        else message = errorConstants.TOKENS.TOKEN_UPDATE;
    }
    catch (err) {
        generalHelpers.log("Connection failure to mongodb", err);
        message = errorConstants.GENERAL.DATABASE;
    }
    finally { await client?.close(); }
    return {data, status, message};
};
