const bcrypt = require("bcryptjs");

const errorConstants = require('../../constants/errorConstants');
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const avatarsHelpers = require('../../helpers/cloudary/avatarsHelpers');

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
    const username = req.username;
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Save user avatar in the cloud & database
    const databaseUser = userByUsernameData.data;
    const cloudUpdateUserAvatarData = await avatarsHelpers.cloudUpdateUserAvatar(databaseUser, file);
    return res.send(cloudUpdateUserAvatarData);
};

// DELETE: Delete user avatar
module.exports.deleteAvatar = async (req, res) => {
    // Get user by username
    const username = req.username;
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Remove avatar in the cloud & database
    const databaseUser = userByUsernameData.data;
    const cloudDeleteUserAvatarData = await avatarsHelpers.cloudDeleteUserAvatar(databaseUser);
    return res.send(cloudDeleteUserAvatarData);
};

// POST: Update user info
module.exports.updateInfo = async (req, res) => {
    // Form data the query
    const {name, phone, email, description} = req.body;

    // Save user info in the database
    const username = req.username;
    const updateUserInfoByUsernameData = await usersHelpers.updateUserInfoByUsername(
        username, {name, phone, email, description}
    );
    return res.send(updateUserInfoByUsernameData);
};

// POST: Update user password
module.exports.updatePassword = async (req, res) => {
    // Form data the query
    const {oldPassword, newPassword} = req.body;
    if(oldPassword === newPassword) {
        return res.send({status: false, data: null, message: errorConstants.USERS.SAME_PASSWORD});
    }

    // Get user by username
    const username = req.username;
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Check old password with database password
    const databaseUser = userByUsernameData.data;
    if(!await bcrypt.compare(oldPassword, databaseUser.password)) {
        return res.send({status: false, message: errorConstants.USERS.PASSWORD_NOT_MATCH, data: null});
    }

    // Save user info in the database
    const password = await bcrypt.hash(newPassword, 10);
    const updateUserPasswordByUsernameData = await usersHelpers.updateUserPasswordByUsername(username, password);
    return res.send(updateUserPasswordByUsernameData);
};
