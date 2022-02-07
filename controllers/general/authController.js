const errorConstants = require("../../constants/errorConstants");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const tokensHelpers = require("../../helpers/mongodb/tokensHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const companyHelpers = require("../../helpers/mongodb/companyHelpers");

// POST: Attempt login
module.exports.login = async (req, res) => {
    // Form data & data
    const {username, password} = req.body;

    // Check if request is made by a human
    const useragent = req.useragent;
    if(!!useragent.isBot) {
        return res.send({status: false, message: errorConstants.GENERAL.BOT_REQUEST, data: null});
    }

    // Form checker
    if(!formCheckerHelpers.requiredChecker(username) || !formCheckerHelpers.requiredChecker(password)) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Check user status
    const databaseUser = userByUsernameData.data;
    if(!databaseUser.enable) {
        return res.send({status: false, message: errorConstants.USERS.USER_DISABLED, data: null});
    }

    // Check user auth
    const bcrypt = require("bcryptjs");
    if(!await bcrypt.compare(password, databaseUser.password)) {
        return res.send({status: false, message: errorConstants.USERS.USER_AUTH, data: null});
    }

    // TODO: Fetch company if user has the permission
    // Get company
    const companyData = await companyHelpers.company();
    if(!companyData.status) {
        return res.send(companyData);
    }

    // Generate user tokens
    const databaseCompany = companyData.data;
    const generateUserTokensData = await tokensHelpers.generateUserTokens(databaseUser, useragent);
    if(!generateUserTokensData.status) {
        return res.send(generateUserTokensData);
    }

    return res.send({
        message: "",
        status: true,
        data: {
            user: databaseUser.responseFormat,
            tokens: generateUserTokensData.data,
            company: databaseCompany.responseFormat
        }
    });
};

// POST: Attempt logout
module.exports.logout = async (req, res) => {
    // Data
    const username = req.username;

    // Check if request is made by a human
    const useragent = req.useragent;
    if(!!useragent.isBot) {
        return res.send({status: false, message: errorConstants.GENERAL.BOT_REQUEST, data: null});
    }

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Delete to user token in database
    const databaseUser = userByUsernameData.data;
    return res.send(await tokensHelpers.removeUserToken(databaseUser, useragent));
};

// POST: Refresh user data (equivalent to fetch user data)
module.exports.refresh = async (req, res) => {
    // Data
    const username = req.username;

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Check user status
    const databaseUser = userByUsernameData.data;
    if(!databaseUser.enable) {
        return res.send({status: false, message: errorConstants.USERS.USER_DISABLED, data: null});
    }

    return res.send({...userByUsernameData, data: databaseUser.responseFormat});
};

// POST: Create a new access token
module.exports.token = async (req, res) => {
    // Data
    const username = req.username;
    const token = req.token;

    // Check if request is made by a human
    const useragent = req.useragent;
    if(!!useragent.isBot) {
        return res.send({status: false, message: errorConstants.GENERAL.BOT_REQUEST, data: null});
    }

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Delete to user token in database
    const databaseUser = userByUsernameData.data;
    return res.send(await tokensHelpers.checkUserToken(databaseUser, useragent, token));
};
