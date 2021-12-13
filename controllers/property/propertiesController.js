const errorConstants = require("../../constants/errorConstants");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");
const propertyPicturesHelpers = require("../../helpers/cloudary/propertyPicturesHelpers");

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

    // Route params
    const {propertyId} = req.params;

    // Save property picture in the cloud & database
    const updateUserAvatarData = await avatarsHelpers.updateUserAvatar(databaseUser, file);
    return res.send(updateUserAvatarData);
};

// DELETE: Delete property picture
module.exports.deletePicture = async (req, res) => {
    // Route params
    const {propertyId, pictureId} = req.params;

    // Remove picture in the cloud & database
    const cloudDeletePropertyPictureData = await propertyPicturesHelpers.cloudDeletePropertyPicture(propertyId, pictureId);
    return res.send(cloudDeletePropertyPictureData);
};
