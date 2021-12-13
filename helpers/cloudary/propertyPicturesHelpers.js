const filesHelpers = require('./filesHelpers');
const generalHelpers = require("../generalHelpers");
const usersHelpers = require('../mongodb/usersHelpers');

// Data
const cloudFolder = 'immobignolex/avatars/';

// Delete property picture in cloud
module.exports.cloudDeletePropertyPicture = async (propertyId, pictureId) => {
    // Cloud call & db save
    await filesHelpers.cloudRemoveFile(pictureId);
    return await usersHelpers.updateUserAvatar(user.username, null);
};
