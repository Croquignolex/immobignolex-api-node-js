const generalHelpers = require("../../helpers/generalHelpers");
const errorConstants = require("../../constants/errorConstants");
const goodsHelpers = require("../../helpers/mongodb/goodsHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const chambersHelpers = require("../../helpers/mongodb/chambersHelpers");
const goodPicturesHelpers = require("../../helpers/cloudary/goodPicturesHelpers");

// GET: All goods
module.exports.goods = async (req, res) => {
    return res.send(await goodsHelpers.goodsWithChamber());
};

// GET: Good
module.exports.good = async (req, res) => {
    // Route params
    const {goodId} = req.params;
    return res.send(await goodsHelpers.goodByIdWithChamberAndCreator(goodId));
};

// PUT: Create good
module.exports.create = async (req, res) => {
    // Form data & data
    const username = req.username;
    const {name, color, weigh, height, chamber, property, description} = req.body;

    // Form checker
    if(
        !formCheckerHelpers.requiredChecker(name) ||
        !formCheckerHelpers.requiredChecker(color) ||
        !formCheckerHelpers.requiredChecker(chamber) ||
        !formCheckerHelpers.requiredChecker(property)
    ) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Check good color
    const colorCheck = generalHelpers.goodsColors(color);
    if(!colorCheck) {
        return res.send({data: null, status: false, message: errorConstants.GOODS.WRONG_GOOD_COLOR});
    }

    // Check property chamber
    const propertyHasChamberCheck = await chambersHelpers.propertyHasChamber(property, chamber);
    if(!propertyHasChamberCheck.status) {
        return res.send({...propertyHasChamberCheck, message: errorConstants.CHAMBERS.WRONG_CHAMBER_PROPERTY});
    }

    // Check chamber existence
    const chamberCheck = await chambersHelpers.chamberById(chamber);
    if(!chamberCheck.status) {
        return res.send(chamberCheck);
    }

    // Database saving
    return res.send(await goodsHelpers.createGood({
        name, weigh, color, height, chamber, property, description, creator: username
    }));
};

// POST: Update good info
module.exports.updateInfo = async (req, res) => {
    // Form data & data
    const {goodId} = req.params;
    const {name, color, weigh, height, description} = req.body;

    // Form checker
    if(
        !formCheckerHelpers.requiredChecker(name) ||
        !formCheckerHelpers.requiredChecker(color)
    ) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Check good color
    const colorCheck = generalHelpers.goodsColors(color);
    if(!colorCheck) {
        return res.send({data: null, status: false, message: errorConstants.GOODS.WRONG_GOOD_COLOR});
    }

    // Update good
    return res.send(await goodsHelpers.updateGood({
        id: goodId, name, color, weigh, height, description
    }));
};

// DELETE: Archive good
module.exports.deleteGood = async (req, res) => {
    // Form data & data
    const {goodId} = req.params;
    return res.send(await goodsHelpers.deleteGoodByGoodId(goodId));
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

    // Save good picture in the cloud & database
    const {goodId} = req.params;
    return res.send(await goodPicturesHelpers.cloudAddGoodPicture(goodId, file));
};

// DELETE: Delete good picture
module.exports.deletePicture = async (req, res) => {
    // Route params
    const {goodId, pictureId} = req.params;
    const cloudPictureId = pictureId.split('-').join('/');

    // Remove picture in the cloud & database
    return res.send(await goodPicturesHelpers.cloudRemovePropertyPicture(goodId, cloudPictureId));
};
