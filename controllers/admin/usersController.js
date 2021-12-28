const errorConstants = require("../../constants/errorConstants");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const avatarsHelpers = require("../../helpers/cloudary/avatarsHelpers");

// GET: administrators
module.exports.administrators = async (req, res) => {
    // Request data
    const username = req.username;

    // Get administrators
    const administratorsWithoutUserByUsernameData = await usersHelpers.administratorsWithoutUserByUsername(username);
    return res.send(administratorsWithoutUserByUsernameData);
};

// GET: employees
module.exports.employees = async (req, res) => {
    // Request data
    const username = req.username;

    // Get employees
    const employeesWithoutUserByUsernameData = await usersHelpers.employeesWithoutUserByUsername(username);
    return res.send(employeesWithoutUserByUsernameData);
};

// GET: tenants
module.exports.tenants = async (req, res) => {
    // Request data
    const username = req.username;

    // Get tenants
    const tenantsWithoutUserByUsernameData = await usersHelpers.tenantsWithoutUserByUsername(username);
    return res.send(tenantsWithoutUserByUsernameData);
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

    // Update user
    const updateUserInfoByUsernameData = await usersHelpers.updateUserInfoByUsername(
        username,
        {name, phone, email, cni, post, description}
    );
    return res.send(updateUserInfoByUsernameData);
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
    const updateUserStatusByUsernameData = await usersHelpers.updateUserStatusByUsername(
        username,
        !userByUsernameData.data?.enable
    );
    return res.send(updateUserStatusByUsernameData);
};

// POST: Reset user password
module.exports.resetPassword = async (req, res) => {
    // Form data & data
    const {username} = req.params;

    // Save user info in the database
    const bcrypt = require("bcryptjs");
    const password = await bcrypt.hash("000000", 10);
    const updateUserPasswordByUsernameData = await usersHelpers.updateUserPasswordByUsername(username, password);
    return res.send(updateUserPasswordByUsernameData);
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
    const cloudDeleteUserAvatarData = await avatarsHelpers.cloudDeleteUserAvatar(databaseUser);
    return res.send(cloudDeleteUserAvatarData);
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
    const cloudUpdateUserAvatarData = await avatarsHelpers.cloudUpdateUserAvatar(databaseUser, file);
    return res.send(cloudUpdateUserAvatarData);
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
    const createAdministratorData = await usersHelpers.createAdministrator({
        name: name.trim(), phone, email, cni, description, creator: username
    });
    return res.send(createAdministratorData);
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
    const createEmployeeData = await usersHelpers.createEmployee({
        name: name.trim(), phone, email, post, cni, description, creator: username
    });
    return res.send(createEmployeeData);
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
    const createTenantData = await usersHelpers.createTenant({
        name: name.trim(), phone, cni, email, description, creator: username
    });
    return res.send(createTenantData);
};
