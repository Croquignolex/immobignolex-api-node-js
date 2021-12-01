const filesHelpers = require('filesHelpers');

const cloudFolder = 'avatar';

module.exports.userAvatar = async () => {
    return {message: "", status: true, data: null};
};

module.exports.updateUserAvatar = async (user, file) => {
    return await filesHelpers.updateFile(user.avatar, file, cloudFolder);
};

module.exports.deleteUserAvatar = async () => {
    return {message: "", status: true, data: null};
};
