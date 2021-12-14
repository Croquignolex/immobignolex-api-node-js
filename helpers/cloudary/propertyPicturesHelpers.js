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

    // Update property pictures in memory
    const pictures = property.pictures || [];
    const propertyPicture = fileHelperData.data;
    pictures.push({url: propertyPicture.url, id: propertyPicture.public_id, secure: propertyPicture.secure_url});

    // Save into database
    const updatePropertyPicturesData = await propertiesHelpers.updatePropertyPictures(property._id, pictures);
    if(!updatePropertyPicturesData.status) {
        return updatePropertyPicturesData;
    }

    return {...updatePropertyPicturesData, data: generalHelpers.picturesPublicUrl(pictures)};
};

// Delete property picture in cloud
module.exports.cloudDeletePropertyPicture = async (property, pictureId) => {
    const pictures = property.pictures || [];
    pictures.filter((picture) => !(picture.id === pictureId));

    // Cloud call & db save
    await filesHelpers.cloudRemoveFile(pictureId);

    // Save into database
    const updatePropertyPicturesData = await propertiesHelpers.updatePropertyPictures(property._id, pictures);
    if(!updatePropertyPicturesData.status) {
        return updatePropertyPicturesData;
    }

    return {...updatePropertyPicturesData, data: generalHelpers.picturesPublicUrl(pictures)};
};
