const filesHelpers = require('./filesHelpers');
const generalHelpers = require("../generalHelpers");
const chambersHelpers = require('../mongodb/chambersHelpers');

// Upload chamber picture to cloud
module.exports.cloudAddChamberPicture = async (chamberId, file) => {
    const filePath = file.path;

    // Upload file to cloud & delete temp file
    const fileHelperData = await filesHelpers.cloudAddFile(filePath, 'immobignolex/chambers/');
    await generalHelpers.deleteFileFromPath(filePath);
    if(!fileHelperData.status) {
        return fileHelperData;
    }

    // Data
    const chamberPicture = fileHelperData.data;
    const picture = {url: chamberPicture.url, id: chamberPicture.public_id, secure: chamberPicture.secure_url};

    // Save into database
    const addChamberPictureByChamberIdData = await chambersHelpers.addChamberPictureByChamberId(chamberId, picture);
    if(!addChamberPictureByChamberIdData.status) {
        return addChamberPictureByChamberIdData;
    }

    return {...addChamberPictureByChamberIdData, data: generalHelpers.picturePublicUrl(picture)};
};

// Delete chamber picture in cloud
module.exports.cloudRemoveChamberPicture = async (chamberId, pictureId) => {
    // Cloud call & db save
    await filesHelpers.cloudRemoveFile(pictureId);
    return await chambersHelpers.removeChamberPictureByChamberId(chamberId, pictureId);
};
