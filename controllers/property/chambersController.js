const generalHelpers = require("../../helpers/generalHelpers");
const errorConstants = require("../../constants/errorConstants");
const goodsHelpers = require("../../helpers/mongodb/goodsHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const chambersHelpers = require("../../helpers/mongodb/chambersHelpers");
const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");
const chamberPicturesHelpers = require("../../helpers/cloudary/chamberPicturesHelpers");

// GET: All chambers
module.exports.chambers = async (req, res) => {
    return res.send(await chambersHelpers.chambersWithProperty());
};

// GET: Chamber
module.exports.chamber = async (req, res) => {
    // Route params
    const {chamberId} = req.params;
    return res.send(await chambersHelpers.chamberByIdWithPropertyAndCreator(chamberId));
};

// PUT: Create chamber
module.exports.create = async (req, res) => {
    // Form data & data
    const username = req.username;
    const {name, phone, rent, type, property, description} = req.body;

    // Form checker
    if(
        !formCheckerHelpers.requiredChecker(rent) ||
        !formCheckerHelpers.requiredChecker(type) ||
        !formCheckerHelpers.requiredChecker(name) ||
        !formCheckerHelpers.requiredChecker(property)
    ) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Check lease period & retrieve rank
    const typeCheck = generalHelpers.chambersTypes(type);
    if(!typeCheck) {
        return res.send({data: null, status: false, message: errorConstants.CHAMBERS.WRONG_CHAMBER_TYPE});
    }

    // Check rent format
    const rentCheck = parseInt(rent, 10);
    if(!rentCheck) {
        return res.send({data: null, status: false, message: errorConstants.CHAMBERS.WRONG_CHAMBER_RENT});
    }

    // Check property existence
    const propertyCheck = await propertiesHelpers.propertyById(property);
    if(!propertyCheck.status) {
        return res.send(propertyCheck);
    }

    // Database saving
    return res.send(await chambersHelpers.createChamber({
        name, phone, type, property, description, rent: rentCheck, creator: username
    }));
};

// POST: Update chamber info
module.exports.updateInfo = async (req, res) => {
    // Form data & data
    const {chamberId} = req.params;
    const {name, phone, rent, type, property, description} = req.body;

    // Form checker
    if(
        !formCheckerHelpers.requiredChecker(rent) ||
        !formCheckerHelpers.requiredChecker(type) ||
        !formCheckerHelpers.requiredChecker(name) ||
        !formCheckerHelpers.requiredChecker(property)
    ) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Check lease period & retrieve rank
    const typeCheck = generalHelpers.chambersTypes(type);
    if(!typeCheck) {
        return res.send({data: null, status: false, message: errorConstants.CHAMBERS.WRONG_CHAMBER_TYPE});
    }

    // Check rent format
    const rentCheck = parseInt(rent, 10);
    if(!rentCheck) {
        return res.send({data: null, status: false, message: errorConstants.CHAMBERS.WRONG_CHAMBER_RENT});
    }

    // Check property existence
    const propertyCheck = await propertiesHelpers.propertyById(property);
    if(!propertyCheck.status) {
        return res.send(propertyCheck);
    }

    // Update chamber
    return res.send(await chambersHelpers.updateChamber({
        id: chamberId, name, phone, type, property, description, rent: rentCheck
    }));
};

// DELETE: Archive chamber
module.exports.deleteChamber = async (req, res) => {
    // Form data & data
    const {chamberId} = req.params;

    // Update chamber visibility
    const archiveChamberByChamberIdData = await chambersHelpers.archiveChamberByChamberId(chamberId);
    return res.send(archiveChamberByChamberIdData);
};

// PUT: Add chamber picture
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
    const {chamberId} = req.params;

    // Save chamber picture in the cloud & database
    const cloudAddChamberPictureData = await chamberPicturesHelpers.cloudAddChamberPicture(chamberId, file);
    return res.send(cloudAddChamberPictureData);
};

// DELETE: Delete chamber picture
module.exports.deletePicture = async (req, res) => {
    // Route params
    const {chamberId, pictureId} = req.params;
    const cloudPictureId = pictureId.split('-').join('/');

    // Remove picture in the cloud & database
    const cloudRemoveChamberPictureData = await chamberPicturesHelpers.cloudRemoveChamberPicture(chamberId, cloudPictureId);
    return res.send(cloudRemoveChamberPictureData);
};

// GET: All goods
module.exports.goods = async (req, res) => {
    // Route params
    const {chamberId} = req.params;

    // Get chamber goods
    const chamberGoodsData = await goodsHelpers.chamberGoods(chamberId);
    return res.send(chamberGoodsData);
};
