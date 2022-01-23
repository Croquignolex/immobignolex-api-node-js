const errorConstants = require("../../constants/errorConstants");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const avatarsHelpers = require("../../helpers/cloudary/avatarsHelpers");

// GET: administrators
module.exports.administrators = async (req, res) => {
    // Request data
    const username = req.username;
    return res.send(await usersHelpers.administratorsWithoutUserByUsername(username));
};

// GET: employees
module.exports.employees = async (req, res) => {
    // Request data
    const username = req.username;
    return res.send(await usersHelpers.employeesWithoutUserByUsername(username));
};

// GET: tenants
module.exports.tenants = async (req, res) => {
    // Request data
    const username = req.username;
    return res.send(await usersHelpers.tenantsWithoutUserByUsername(username));
};

// GET: User
module.exports.user = async (req, res) => {
    // Route params
    const {username} = req.params;

    // Get user
    const userByUsernameWithCreatorData = await usersHelpers.userByUsernameWithCreator(username);

    // Super admin user should not be shown
    const databaseUser = userByUsernameWithCreatorData.data;
    if(databaseUser.role === "Propriétaire") {
        return res.send({status: false, data: null, message: errorConstants.GENERAL.HIGH_LEVEL_DATA});
    }

    return res.send(userByUsernameWithCreatorData);
};

// POST: Update user info
module.exports.updateInfo = async (req, res) => {
    // Form data & data
    const {username} = req.params;
    const {name, phone, email, cni, post, description} = req.body;

    // Form checker
    if(!formCheckerHelpers.requiredChecker(name)) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Update user
    return res.send(await usersHelpers.updateUserInfo({
        username, name, phone, email, cni, post, description
    }));
};

// POST: Toggle user status
module.exports.toggleStatus = async (req, res) => {
    // Form data & data
    const {username} = req.params;

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Update user
    const databaseUser = userByUsernameData.data;
    return res.send(await usersHelpers.updateUserStatus({username, status: !databaseUser?.enable}));
};

// POST: Reset user password
module.exports.resetPassword = async (req, res) => {
    // Form data & data
    const {username} = req.params;

    // Save user info in the database
    const bcrypt = require("bcryptjs");
    const password = await bcrypt.hash("000000", 10);
    return res.send(await usersHelpers.updateUserPassword({username, password}));
};

// DELETE: Delete user avatar
module.exports.deleteAvatar = async (req, res) => {
    // Get user by username
    const {username} = req.params;
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Remove avatar in the cloud & database
    const databaseUser = userByUsernameData.data;
    return res.send(await avatarsHelpers.cloudDeleteUserAvatar(databaseUser));
};

// POST: Update user avatar
module.exports.updateAvatar = async (req, res) => {
    // File data from multer (error management)
    const pictureError = req.picture;
    if(pictureError) {
        return res.send({status: false, data: null, message: pictureError});
    }

    // Check file existence has form data
    const file = req.file;
    if(!file) {
        return res.send({status: false, data: null, message: errorConstants.GENERAL.FORM_DATA});
    }

    // Get user by username
    const {username} = req.params;
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Save user avatar in the cloud & database
    const databaseUser = userByUsernameData.data;
    return res.send(await avatarsHelpers.cloudUpdateUserAvatar(databaseUser, file));
};

// PUT: Create administrator
module.exports.createAdministrator = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, email, cni, description} = req.body;

    // Form checker
    if(!formCheckerHelpers.requiredChecker(name)) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Database saving
    return res.send(await usersHelpers.createAdministrator({
        name: name.trim(), phone, email, cni, description, creator: username
    }));
};

// PUT: Create employee
module.exports.createEmployee = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, email, cni, description, post} = req.body;

    // Form checker
    if(!formCheckerHelpers.requiredChecker(name)) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Database saving
    return res.send(await usersHelpers.createEmployee({
        name: name.trim(), phone, email, post, cni, description, creator: username
    }));
};

// PUT: Create tenant
module.exports.createTenant = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, cni, email, description} = req.body;

    // Form checker
    if(!formCheckerHelpers.requiredChecker(name)) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Database saving
    return res.send(await usersHelpers.createTenant({
        name: name.trim(), phone, cni, email, description, creator: username
    }));
};
