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

    const username = req.username;

    // Save user avatar in the cloud
    const file = req.file;
    const saveUserAvatarData = await avatarsHelpers.saveUserAvatar(file);
    if(!saveUserAvatarData.status) {
        return res.send(saveUserAvatarData);
    }

    // Get user by username
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    const updateUserAvatarByUserIdData = await usersHelpers.updateUserAvatarByUserId(username, file);
    return res.send(updateUserAvatarByUserIdData);
};

// DELETE: Delete user avatar
module.exports.deleteAvatar = async (req, res) => {
    // Data
    const username = req.username;
    return res.send({message: "", status: true, data: null});
};
