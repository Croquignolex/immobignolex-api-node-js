const errorConstants = require("../../constants/errorConstants");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");

// GET: administrators
module.exports.administrators = async (req, res) => {
    // Request data
    const username = req.username;

    // Get administrators
    const administratorsWithoutUserByUsernameData = await usersHelpers.administratorsWithoutUserByUsername(username);
    return res.send(administratorsWithoutUserByUsernameData);
};

// GET: User
module.exports.user = async (req, res) => {
    // Route params
    const {username} = req.params;

    // Get user
    const userByUsernameData = await usersHelpers.userByUsername(username);
    return res.send(userByUsernameData);
};

// PUT: Create administrator
module.exports.createAdministrator = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, email, description} = req.body;

    // Form checker
    if(!formCheckerHelpers.requiredChecker(name)) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Database saving
    const createCaretakerData = await usersHelpers.createAdministrator({
        name: name.trim(), phone, email, description, creator: username
    });
    return res.send(createCaretakerData);
};
