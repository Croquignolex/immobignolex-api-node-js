const filesHelpers = require('./filesHelpers');
const usersHelpers = require('../mongodb/usersHelpers');
const generalHelpers = require("../generalHelpers");

const cloudFolder = 'immobignolex/avatars/';

module.exports.userAvatar = async () => {
    return {message: "", status: true, data: null};
};

// Upload user avatar to cloud
module.exports.updateUserAvatar = async (user, file) => {
    const filePath = file.path;
    const oldUserAvatar = user.avatar;

    // Upload file to cloud
    const fileHelperData = (oldUserAvatar)
        ? await filesHelpers.updateFile(oldUserAvatar, filePath, cloudFolder)
        : await filesHelpers.addFile(filePath, cloudFolder)

    if(!fileHelperData.status) {
        return fileHelperData;
    }

    await generalHelpers.deleteFileFromPath(filePath);

    // Keep into data base
    const newUserAvatar = fileHelperData.data;
    return await usersHelpers.updateUserAvatar(user, {
        url: newUserAvatar.url,
        id: newUserAvatar.public_id,
        secure: newUserAvatar.secure_url,
    });
};

module.exports.deleteUserAvatar = async () => {
    return {message: "", status: true, data: null};
};
