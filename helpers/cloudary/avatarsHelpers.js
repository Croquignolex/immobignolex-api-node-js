const filesHelpers = require('./filesHelpers');
const usersHelpers = require('../mongodb/usersHelpers');

const cloudFolder = 'avatar';

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

    // Keep into data base
    const newUserAvatar = fileHelperData.data;
    return await usersHelpers.updateUserAvatar(user, {
        url: newUserAvatar.url,
        id: newUserAvatar.asset_id,
        secure: newUserAvatar.secure_url,
    });
};

module.exports.deleteUserAvatar = async () => {
    return {message: "", status: true, data: null};
};
