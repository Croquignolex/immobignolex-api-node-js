const errorConstants = require("../../constants/errorConstants");
const goodsHelpers = require("../../helpers/mongodb/goodsHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const goodPicturesHelpers = require("../../helpers/cloudary/goodPicturesHelpers");

// GET: All goods
module.exports.goods = async (req, res) => {
    // Get goods
    const goodsWithChamberData = await goodsHelpers.goodsWithChamber();
    return res.send(goodsWithChamberData);
};

// GET: Good
module.exports.good = async (req, res) => {
    // Route params
    const {goodId} = req.params;

    // Get good
    const goodByIdWithChamberAndCreatorData = await goodsHelpers.goodByIdWithChamberAndCreator(goodId);
    return res.send(goodByIdWithChamberAndCreatorData);
};

// PUT: Create good
module.exports.create = async (req, res) => {
    // Form data & data
    const username = req.username;
    const {name, color, weigh, height, chamber, description} = req.body;

    // Form checker
    if(
        !formCheckerHelpers.requiredChecker(name) ||
        !formCheckerHelpers.requiredChecker(color) ||
        !formCheckerHelpers.requiredChecker(chamber)
    ) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Database saving
    const createGoodData = await goodsHelpers.createGood({
        name, weigh, color, height, chamber, description, creator: username
    });
    return res.send(createGoodData);
};

// POST: Update good info
module.exports.updateInfo = async (req, res) => {
    // Form data & data
    const {goodId} = req.params;
    const {name, color, weigh, height, chamber, description} = req.body;

    // Form checker
    if(
        !formCheckerHelpers.requiredChecker(name) ||
        !formCheckerHelpers.requiredChecker(color) ||
        !formCheckerHelpers.requiredChecker(chamber)
    ) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Update good
    const updateGoodData = await goodsHelpers.updateGood({
        id: goodId, name, color, weigh, height, chamber, description
    });
    return res.send(updateGoodData);
};

// DELETE: Archive good
module.exports.archiveGood = async (req, res) => {
    // Form data & data
    const {goodId} = req.params;

    // Update good visibility
    const archiveGoodByGoodIdData = await goodsHelpers.archiveGoodByGoodId(goodId);
    return res.send(archiveGoodByGoodIdData);
};

// PUT: Add good picture
module.exports.addPicture = async (req, res) => {
    // File data from multer (error management)
    const pictureError = req.picture;
    if(pictureError) {
        return res.send({status: false, data: null, message: pictureError});
    }

    // Check file existence has form data
    const file = req.file;
    if(!file) {
        return res.send({status: false, data: null, message: errorConstants.GENERAL.FORM_DATA});
    }

    // Route params
    const {goodId} = req.params;

    // Save good picture in the cloud & database
    const cloudAddGoodPictureData = await goodPicturesHelpers.cloudAddGoodPicture(goodId, file);
    return res.send(cloudAddGoodPictureData);
};

// DELETE: Delete good picture
module.exports.deletePicture = async (req, res) => {
    // Route params
    const {goodId, pictureId} = req.params;
    const cloudPictureId = pictureId.split('-').join('/');

    // Remove picture in the cloud & database
    const cloudRemovePropertyPictureData = await goodPicturesHelpers.cloudRemovePropertyPicture(goodId, cloudPictureId);
    return res.send(cloudRemovePropertyPictureData);
};
