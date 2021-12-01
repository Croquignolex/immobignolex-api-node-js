const cloudinary = require('cloudinary').v2;

const envConstants = require('../../constants/envConstants');

cloudinary.config({
    secure: envConstants.CLOUDINARY.SECURE,
    cloud_name: envConstants.CLOUDINARY.NAME,
    api_key: envConstants.CLOUDINARY.API_KEY,
    api_secret: envConstants.CLOUDINARY.API_SECRET,
});

module.exports.getFile = async () => {
    return {message: "", status: true, data: null};
};

module.exports.addFile = async () => {
    return {message: "", status: true, data: null};
};

module.exports.updateFile = async (oldFileName, newFile, cloudFolder) => {
    // Delete old file
    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload(newFile, (error, result) => {
            console.log(result, error);
            resolve({message: "", status: true, data: null})
        });
    });
};

module.exports.removeFile = async () => {
    return {message: "", status: true, data: null};
};
