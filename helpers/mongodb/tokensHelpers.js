const dayjs = require('dayjs');

const generalHelpers = require('../generalHelpers');
const usersHelpers = require('../mongodb/usersHelpers');
const errorConstants = require('../../constants/errorConstants');

module.exports.generateUserTokens = async (user, useragent) => {
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
        {username: user.username, permissions: user.permissions}
    );

    // Update user token
    let refreshToken = "";
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
        refreshToken = generalHelpers.buildJwtToken(false, {username: user.username});
        tokens.push({
            browser, version, os, mobile, desktop,
            token: refreshToken,
            usedAt: currentDate,
            createdAt: currentDate
        });
    }

    // Update user tokens
    const updateUserTokensByUserIdData = await usersHelpers.updateUserTokensByUserId(user._id, tokens);
    if(!updateUserTokensByUserIdData.status) {
        return updateUserTokensByUserIdData;
    }

    // Send generated tokens
    const data = {access: accessToken, refresh: refreshToken};
    return {message: "", status: true, data};
};

module.exports.removeUserToken = async (user, useragent) => {
    // Extract user agent data
    const tokens = user?.tokens || [];
    const mobile = useragent?.isMobile;
    const os = useragent?.os.toString();
    const desktop = useragent?.isDesktop;
    const browser = useragent?.browser.toString();

    // Remove user token for the current agent
    tokens.filter(token => !(
        token?.browser === browser &&
        token?.desktop === desktop &&
        token?.mobile === mobile &&
        token?.os === os
    ));

    // Update user tokens
    return await usersHelpers.updateUserTokens(user, tokens);
};

module.exports.checkUserToken = async (user, useragent, refreshToken) => {
    // Extract user agent data
    const tokens = user?.tokens || [];
    const mobile = useragent?.isMobile;
    const os = useragent?.os.toString();
    const desktop = useragent?.isDesktop;
    const browser = useragent?.browser.toString();

    // Check if user agent is trusted
    const tokenNeedle = tokens.find(token => (
        token?.token === refreshToken &&
        token?.browser === browser &&
        token?.desktop === desktop &&
        token?.mobile === mobile &&
        token?.os === os
    ));

    // Generate new access token for trusted user agent
    if(tokenNeedle) {
        const accessToken = generalHelpers.buildJwtToken(
            true,
            {username: user.username, permissions: user.permissions}
        );
        return {message: "", status: true, data: accessToken};
    }
    // Token not found for this user agent
    return {message: errorConstants.USERS.USER_TOKEN, status: false, data: null};
};

