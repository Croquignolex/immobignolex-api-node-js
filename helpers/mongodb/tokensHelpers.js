const dayjs = require('dayjs');
const {MongoClient} = require('mongodb');

const generalHelpers = require('../generalHelpers');
const envConstants = require('../../constants/envConstants');
const errorConstants = require('../../constants/errorConstants');

// Data
const usersCollection = "users";
const databaseUrl = envConstants.DATABASE_URL;

module.exports.generateUserTokens = async (user, useragent) => {
    // Connection configuration
    let client, refreshToken = "", data = null, status = false, message = "";
    client = new MongoClient(databaseUrl);

    // Extract user agent data
    const tokens = user?.tokens || [];
    const mobile = useragent?.isMobile;
    const os = useragent?.os.toString();
    const desktop = useragent?.isDesktop;
    const currentDate = dayjs().valueOf();
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
                    token.usedAt = currentDate;
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
                usedAt: currentDate,
                createdAt: currentDate
            })
        }
        // TODO: save token into database
        // Return tokens
        const dbData = await client.db().collection(usersCollection).updateOne(
            {_id: user._id},
            {$set: {tokens}}
        );
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
