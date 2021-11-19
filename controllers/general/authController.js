const bcrypt = require('bcryptjs');

const envConstants = require("../../constants/envConstants");
const errorConstants = require("../../constants/errorConstants");
const xhrRequestHelper = require("../../helpers/xhrRequestHelper");
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

    // Fetch and check users service response
    const usersServiceUserData = await xhrRequestHelper.xhrGetRequest(
        `${envConstants.SERVICE.USERS}/users/${username}`
    );
    if(!usersServiceUserData.status) {
        return res.send(usersServiceUserData);
    }

    // Fetch and check user status
    const databaseUser = usersServiceUserData.data;
    if(!databaseUser.enable) {
        return res.send({status: false, message: errorConstants.USERS.USER_DISABLED, data: null});
    }

    // Check user auth
    if(!await bcrypt.compare(password, databaseUser.password)) {
        return res.send({status: false, message: errorConstants.USERS.USER_AUTH, data: null});
    }

    // Fetch and check tokens service response
    const useragent = req.useragent;
    const tokensServiceGenerateTokens = await xhrRequestHelper.xhrPostRequest(
        `${envConstants.SERVICE.TOKENS}/generate/users/${username}`,
        {useragent}
    );
    if(!tokensServiceGenerateTokens.status) {
        return res.send(tokensServiceGenerateTokens);
    }

    // Format user response
    const responseUserData = {
        name: databaseUser.name,
        email: databaseUser.email,
        roles: databaseUser.roles,
        username: databaseUser.username
    };
    return res.send({
        message: "",
        status: true,
        data: {
            user: responseUserData,
            tokens: tokensServiceGenerateTokens.data
        }
    });
};
