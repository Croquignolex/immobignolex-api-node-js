const cloudinary = require('cloudinary');

const envConstants = require('../../constants/envConstants');
const generalHelpers = require('../../helpers/generalHelpers');
const errorConstants = require('../../constants/errorConstants');

cloudinary.config({
    secure: envConstants.CLOUDINARY.SECURE,
    cloud_name: envConstants.CLOUDINARY.NAME,
    api_key: envConstants.CLOUDINARY.API_KEY,
    api_secret: envConstants.CLOUDINARY.API_SECRET,
});

// Add file in cloud
module.exports.cloudAddFile = async (filePath, folder) => {
    return new Promise((resolve) => {
        cloudinary.v2.uploader.upload(filePath, {folder}, (error, data) => {
            if(error) {
                generalHelpers.log("Connection failure to cloudinary", error);
                resolve({message: errorConstants.GENERAL.CLOUD_SERVICE, status: false, data: null})
            }
            resolve({message: "", status: true, data});
        });
    });
};

module.exports.cloudRemoveFile = async (fileId) => {
    return new Promise((resolve) => {
        cloudinary.v2.uploader.destroy(fileId, (error, data) => {
            if(error) {
                generalHelpers.log("Connection failure to cloudinary", error);
            }
            resolve({message: "", status: true, data: null});
        });
    });
};
