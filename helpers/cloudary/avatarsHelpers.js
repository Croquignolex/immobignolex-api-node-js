const filesHelpers = require('./filesHelpers');
const generalHelpers = require("../generalHelpers");
const usersHelpers = require('../mongodb/usersHelpers');

// Upload user avatar to cloud
module.exports.cloudUpdateUserAvatar = async (user, file) => {
    // Data
    const filePath = file.path;
    const oldUserAvatar = user.avatar;

    // Upload file to cloud & delete temp file
    const fileHelperData = await filesHelpers.cloudAddFile(filePath, 'immobignolex/avatars/');
    await generalHelpers.deleteFileFromPath(filePath);
    if(!fileHelperData.status) {
        return fileHelperData;
    }

    // Delete old image in cloud if exist
    if(oldUserAvatar) {
        await filesHelpers.cloudRemoveFile(oldUserAvatar.id);
    }

    // Keep into database
    const newUserAvatar = fileHelperData.data;
    const avatar = {
        url: newUserAvatar.url,
        id: newUserAvatar.public_id,
        secure: newUserAvatar.secure_url,
    };
    return await usersHelpers.updateUserAvatar({username: user.username, avatar});
};

// Delete user avatar in cloud
module.exports.cloudDeleteUserAvatar = async (user) => {
    // Data
    const avatar = null;
    const oldUserAvatar = user.avatar;

    // Cloud call & db save
    await filesHelpers.cloudRemoveFile(oldUserAvatar.id);
    return await usersHelpers.updateUserAvatar({username: user.username, avatar});
};
