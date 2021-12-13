const filesHelpers = require('./filesHelpers');
const generalHelpers = require("../generalHelpers");
const usersHelpers = require('../mongodb/usersHelpers');

// Data
const cloudFolder = 'immobignolex/avatars/';

// Upload user avatar to cloud
module.exports.cloudUpdateUserAvatar = async (user, file) => {
    const filePath = file.path;
    const oldUserAvatar = user.avatar;

    // Upload file to cloud
    const fileHelperData = await filesHelpers.cloudAddFile(filePath, cloudFolder);
    if(!fileHelperData.status) {
        return fileHelperData;
    }

    // Delete old image n cloud if exist
    if(oldUserAvatar) {
        await filesHelpers.cloudRemoveFile(oldUserAvatar.id);
    }

    // Delete temp image
    await generalHelpers.deleteFileFromPath(filePath);

    // Keep into data base
    const newUserAvatar = fileHelperData.data;
    return await usersHelpers.updateUserAvatar(user.username, {
        url: newUserAvatar.url,
        id: newUserAvatar.public_id,
        secure: newUserAvatar.secure_url,
    });
};

// Delete user avatar in cloud
module.exports.cloudDeleteUserAvatar = async (user) => {
    const oldUserAvatar = user.avatar;

    // Cloud call & db save
    await filesHelpers.cloudRemoveFile(oldUserAvatar.id);
    return await usersHelpers.updateUserAvatar(user.username, null);
};
