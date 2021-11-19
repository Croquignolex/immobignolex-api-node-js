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
        return res.send({status: false, message: errorConstants.GENERAL.BOT_REQUEST, data: null});
    }

    // Form checker
    const {requiredChecker, passwordChecker} = formCheckerHelpers;
    if(!requiredChecker(username) || !passwordChecker(password)) {
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
    if(!await bcrypt.compare(password, databaseUser.password)) {
        return res.send({status: false, message: errorConstants.USERS.USER_AUTH, data: null});
    }

    // Generate user tokens
    const generateUserTokensData = await tokensHelpers.generateUserTokens(databaseUser, useragent);
    if(!generateUserTokensData.status) {
        return res.send(generateUserTokensData);
    }

    return res.send({
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
        return res.send({status: false, message: errorConstants.GENERAL.BOT_REQUEST, data: null});
    }

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Delete to user token in database
    const databaseUser = userByUsernameData.data;
    const removeUserTokenData = await tokensHelpers.removeUserToken(databaseUser, useragent);
    res.send(removeUserTokenData);
};

// POST: Refresh user data (equivalent to fetch user data)
module.exports.refresh = async (req, res) => {
    // Data
    const username = req.username;
    // Fetch user into local database
    const getUserByUsernameResponse = await usersHelpers.getUserByUsername(username);
    if(getUserByUsernameResponse.status) {
        const databaseUser = getUserByUsernameResponse.data;
        // While user account exist and is activated, try to auth
        if(databaseUser.status) {
            // Get users roles in database
            const getUserRolesByUsernameResponse = await rolesHelpers.getUserRolesByUsername(username);
            if(getUserRolesByUsernameResponse.status) {
                // Response
                const databaseUserRoles = getUserRolesByUsernameResponse.data;
                return res.send({message: "", status: true, data: {user: databaseUser, roles: databaseUserRoles}});
            }
            return res.send(getUserRolesByUsernameResponse);
        }
        return res.send({status: false, message: errorConstants.USERS.USER_DISABLED, data: null});
    }
    return res.send(getUserByUsernameResponse);
};

// POST: Create a new access token
module.exports.token = async (req, res) => {
    // Data
    const username = req.username;
    const token = req.token;
    // Extract user agent
    const useragent = req.useragent;
    // Check if it one of username token
    const checkUserTokenResponse = await tokenHelpers.checkUserToken(username, token, useragent);
    if(checkUserTokenResponse.status) {
        // Get users roles in database
        const getUserRolesByUsernameResponse = await rolesHelpers.getUserRolesByUsername(username);
        if(getUserRolesByUsernameResponse.status) {
            const databaseUserRoles = getUserRolesByUsernameResponse.data;
            // Generate access token
            const accessToken = generalHelpers.buildJwtToken(
                true,
                {username, permissions: chainRoles(databaseUserRoles)}
            );
            return res.send({status: true, message: "", data: accessToken});
        }
        return res.send(getUserRolesByUsernameResponse);
    }
    return res.send(checkUserTokenResponse);
};
