const bcrypt = require('bcryptjs');

const errorConstants = require("../../constants/errorConstants");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const tokensHelpers = require("../../helpers/mongodb/tokensHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");

// POST: Attempt login
module.exports.login = async (req, res) => {
    // Form data & data
    const {username, password} = req.body;

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
    const useragent = req.useragent;
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
