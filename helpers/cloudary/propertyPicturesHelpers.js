const filesHelpers = require('./filesHelpers');
const generalHelpers = require("../generalHelpers");
const propertiesHelpers = require('../mongodb/propertiesHelpers');

// Data
const cloudFolder = 'immobignolex/properties/';

// Upload property picture to cloud
module.exports.cloudAddPropertyPicture = async (property, file) => {
    const filePath = file.path;

    // Upload file to cloud & delete temp file
    const fileHelperData = await filesHelpers.cloudAddFile(filePath, cloudFolder);
    await generalHelpers.deleteFileFromPath(filePath);
    if(!fileHelperData.status) {
        return fileHelperData;
    }

    // Keep into data base
    const propertyPicture = fileHelperData.data;
    const pictures = property.pictures || [];
    pictures.push({
        url: propertyPicture.url,
        id: propertyPicture.public_id,
        secure: propertyPicture.secure_url,
    });
    return await propertiesHelpers.updatePropertyPictures(property._id, pictures);
};

// Delete property picture in cloud
module.exports.cloudDeletePropertyPicture = async (propertyId, pictureId) => {
    // Cloud call & db save
    await filesHelpers.cloudRemoveFile(pictureId);
    return await propertiesHelpers.deletePropertyPicture(propertyId, pictureId);
};
