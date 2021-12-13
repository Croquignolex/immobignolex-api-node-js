const filesHelpers = require('./filesHelpers');
const generalHelpers = require("../generalHelpers");
const propertiesHelpers = require('../mongodb/propertiesHelpers');

// Data
const cloudFolder = 'immobignolex/properties/';

// Upload property picture to cloud
module.exports.cloudAddPropertyPicture = async (propertyId, file) => {
    const filePath = file.path;

    // Upload file to cloud
    const fileHelperData = await filesHelpers.cloudAddFile(filePath, cloudFolder);
    if(!fileHelperData.status) {
        return fileHelperData;
    }

    // Delete temp image
    await generalHelpers.deleteFileFromPath(filePath);

    // Keep into data base
    const propertyPicture = fileHelperData.data;
    return await propertiesHelpers.addPropertyPicture(propertyId, {
        url: propertyPicture.url,
        id: propertyPicture.public_id,
        secure: propertyPicture.secure_url,
    });
};

// Delete property picture in cloud
module.exports.cloudDeletePropertyPicture = async (propertyId, pictureId) => {
    // Cloud call & db save
    await filesHelpers.cloudRemoveFile(pictureId);
    return await propertiesHelpers.deletePropertyPicture(propertyId, pictureId);
};
