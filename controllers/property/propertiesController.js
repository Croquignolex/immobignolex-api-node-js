const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");
const errorConstants = require("../../constants/errorConstants");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const avatarsHelpers = require("../../helpers/cloudary/avatarsHelpers");

// GET: All properties
module.exports.properties = async (req, res) => {
    // Get properties
    const propertiesData = await propertiesHelpers.propertiesWithCaretaker();
    return res.send(propertiesData);
};

// PUT: Add property picture
module.exports.addPicture = async (req, res) => {
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
    const updateUserAvatarData = await avatarsHelpers.updateUserAvatar(databaseUser, file);
    return res.send(updateUserAvatarData);
};

// DELETE: Delete property picture
module.exports.deletePicture = async (req, res) => {
    // Route params
    const {propertyId, pictureId} = req.params;

    // Remove picture in the cloud & database
    const deleteUserAvatarData = await avatarsHelpers.deleteAvatar(databaseUser);
    return res.send(deleteUserAvatarData);
};
