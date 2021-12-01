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
    if(!req.file) {
        return res.send({status: false, data: null, message: errorConstants.GENERAL.FORM_DATA});
    }

    // Get user by username
    const username = req.username;
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Save user avatar in the cloud
    const file = req.file;
    const databaseUser = userByUsernameData.data;
    const saveUserAvatarData = await avatarsHelpers.updateUserAvatar(databaseUser, file);
    if(!saveUserAvatarData.status) {
        return res.send(saveUserAvatarData);
    }

    // Update user avatar
    const updateUserAvatarByUserIdData = await usersHelpers.updateUserAvatar(databaseUser, file);
    return res.send(updateUserAvatarByUserIdData);
};

// DELETE: Delete user avatar
module.exports.deleteAvatar = async (req, res) => {
    // Data
    const username = req.username;
    return res.send({message: "", status: true, data: null});
};
