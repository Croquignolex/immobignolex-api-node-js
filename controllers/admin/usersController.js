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

// GET: User
module.exports.user = async (req, res) => {
    // Route params
    const {username} = req.params;

    // Get user
    const userByUsernameWithCreatorData = await usersHelpers.userByUsernameWithCreator(username);
    return res.send(userByUsernameWithCreatorData);
};

// POST: Update user info
module.exports.updateInfo = async (req, res) => {
    // Form data & data
    const {username} = req.params;
    const {name, phone, email, description} = req.body;

    // Update user
    const updateUserInfoByUsernameData = await usersHelpers.updateUserInfoByUsername(
        username,
        {name, phone, email, description}
    );
    return res.send(updateUserInfoByUsernameData);
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
