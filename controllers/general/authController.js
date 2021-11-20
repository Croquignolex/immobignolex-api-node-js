const bcrypt = require('bcryptjs');

const errorConstants = require("../../constants/errorConstants");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const tokensHelpers = require("../../helpers/mongodb/tokensHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");

// POST: Attempt login
module.exports.login = async (req, res) => {
    // Form data & data
    const {username, password} = req.body;

    // Check if request is made by a human
    const useragent = req.useragent;
    if(!!useragent?.isBot) {
        return res.json({status: false, message: errorConstants.GENERAL.BOT_REQUEST, data: null});
    }

    // Form checker
    const {requiredChecker, passwordChecker} = formCheckerHelpers;
    if(!requiredChecker(username) || !passwordChecker(password)) {
        return res.json({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.json(userByUsernameData);
    }

    // Check user status
    const databaseUser = userByUsernameData.data;
    if(!databaseUser.enable) {
        return res.json({status: false, message: errorConstants.USERS.USER_DISABLED, data: null});
    }

    // Check user auth
    if(!await bcrypt.compare(password, databaseUser.password)) {
        return res.json({status: false, message: errorConstants.USERS.USER_AUTH, data: null});
    }

    // Generate user tokens
    const generateUserTokensData = await tokensHelpers.generateUserTokens(databaseUser, useragent);
    if(!generateUserTokensData.status) {
        return res.json(generateUserTokensData);
    }

    return res.json({
        message: "",
        status: true,
        data: {
            user: databaseUser?.authResponse,
            tokens: generateUserTokensData?.data
        }
    });
};

// POST: Attempt logout
module.exports.logout = async (req, res) => {
    // Data
    const username = req.username;

    // Check if request is made by a human
    const useragent = req.useragent;
    if(!!useragent?.isBot) {
        return res.json({status: false, message: errorConstants.GENERAL.BOT_REQUEST, data: null});
    }

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.json(userByUsernameData);
    }

    // Delete to user token in database
    const databaseUser = userByUsernameData.data;
    const removeUserTokenData = await tokensHelpers.removeUserToken(databaseUser, useragent);
    return res.json(removeUserTokenData);
};

// POST: Refresh user data (equivalent to fetch user data)
module.exports.refresh = async (req, res) => {
    // Data
    const username = req.username;

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.json(userByUsernameData);
    }

    // Check user status
    const databaseUser = userByUsernameData.data;
    if(!databaseUser.enable) {
        return res.json({status: false, message: errorConstants.USERS.USER_DISABLED, data: null});
    }

    return res.json({
        message: "",
        status: true,
        data: databaseUser?.authResponse
    });
};

// POST: Create a new access token
module.exports.token = async (req, res) => {
    // Data
    const username = req.username;
    const token = req.token;

    // Check if request is made by a human
    const useragent = req.useragent;
    if(!!useragent?.isBot) {
        return res.json({status: false, message: errorConstants.GENERAL.BOT_REQUEST, data: null});
    }

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.json(userByUsernameData);
    }

    // Delete to user token in database
    const databaseUser = userByUsernameData.data;
    const checkUserTokenData = await tokensHelpers.checkUserToken(databaseUser, useragent, token);
    return res.json(checkUserTokenData);
};
