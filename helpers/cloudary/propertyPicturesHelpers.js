const filesHelpers = require('./filesHelpers');
const propertiesHelpers = require('../mongodb/propertiesHelpers');

// Data
const cloudFolder = 'immobignolex/properties/';

// Delete property picture in cloud
module.exports.cloudDeletePropertyPicture = async (propertyId, pictureId) => {
    // Cloud call & db save
    await filesHelpers.cloudRemoveFile(pictureId);
    return await propertiesHelpers.deletePropertyPicture(propertyId, pictureId);
};
