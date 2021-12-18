const filesHelpers = require('./filesHelpers');
const generalHelpers = require("../generalHelpers");
const propertiesHelpers = require('../mongodb/propertiesHelpers');

// Upload property picture to cloud
module.exports.cloudAddPropertyPicture = async (propertyId, file) => {
    const filePath = file.path;

    // Upload file to cloud & delete temp file
    const fileHelperData = await filesHelpers.cloudAddFile(filePath, 'immobignolex/properties/');
    await generalHelpers.deleteFileFromPath(filePath);
    if(!fileHelperData.status) {
        return fileHelperData;
    }

    // Data
    const propertyPicture = fileHelperData.data;
    const picture = {url: propertyPicture.url, id: propertyPicture.public_id, secure: propertyPicture.secure_url};

    // Save into database
    const atomicPropertyUpdateData = await propertiesHelpers.atomicPropertyUpdate(propertyId, {$push: {pictures: picture}});
    if(!atomicPropertyUpdateData.status) {
        return atomicPropertyUpdateData;
    }

    return {...atomicPropertyUpdateData, data: generalHelpers.picturePublicUrl(picture)};
};

// Delete property picture in cloud
module.exports.cloudDeletePropertyPicture = async (propertyId, pictureId) => {
    // Cloud call & db save
    await filesHelpers.cloudRemoveFile(pictureId);
    return await propertiesHelpers.atomicPropertyUpdate(propertyId, {$pull: {pictures: {id: pictureId}}});
};
