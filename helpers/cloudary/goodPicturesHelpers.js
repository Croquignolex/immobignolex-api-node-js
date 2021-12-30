const filesHelpers = require('./filesHelpers');
const generalHelpers = require("../generalHelpers");
const goodsHelpers = require('../mongodb/goodsHelpers');

// Upload good picture to cloud
module.exports.cloudAddGoodPicture = async (goodId, file) => {
    const filePath = file.path;

    // Upload file to cloud & delete temp file
    const fileHelperData = await filesHelpers.cloudAddFile(filePath, 'immobignolex/goods/');
    await generalHelpers.deleteFileFromPath(filePath);
    if(!fileHelperData.status) {
        return fileHelperData;
    }

    // Data
    const goodPicture = fileHelperData.data;
    const picture = {url: goodPicture.url, id: goodPicture.public_id, secure: goodPicture.secure_url};

    // Save into database
    const addGoodPictureByGoodIdData = await goodsHelpers.addGoodPictureByGoodId(goodId, picture);
    if(!addGoodPictureByGoodIdData.status) {
        return addGoodPictureByGoodIdData;
    }

    return {...addGoodPictureByGoodIdData, data: generalHelpers.picturePublicUrl(picture)};
};

// Delete good picture in cloud
module.exports.cloudRemovePropertyPicture = async (goodId, pictureId) => {
    // Cloud call & db save
    await filesHelpers.cloudRemoveFile(pictureId);
    return await goodsHelpers.removeGoodPictureByGoodId(goodId, pictureId);
};
