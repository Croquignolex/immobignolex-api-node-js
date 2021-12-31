const errorConstants = require("../../constants/errorConstants");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const chambersHelpers = require("../../helpers/mongodb/chambersHelpers");
const chamberPicturesHelpers = require("../../helpers/cloudary/chamberPicturesHelpers");

// GET: All chambers
module.exports.chambers = async (req, res) => {
    // Get chambers
    const chambersWithPropertyData = await chambersHelpers.chambersWithProperty();
    return res.send(chambersWithPropertyData);
};

// GET: Chamber
module.exports.chamber = async (req, res) => {
    // Route params
    const {chamberId} = req.params;

    // Get chamber
    const chamberByIdWithPropertyAndCreatorData = await chambersHelpers.chamberByIdWithPropertyAndCreator(chamberId);
    return res.send(chamberByIdWithPropertyAndCreatorData);
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

    // Database saving
    const createChamberData = await chambersHelpers.createChamber({
        name, phone, type, property, description, creator: username, rent
    });
    return res.send(createChamberData);
};

// POST: Update chamber info
module.exports.updateInfo = async (req, res) => {
    // Form data & data
    const {chamberId} = req.params;
    const {name, phone, rent, type, property, description} = req.body;

    // Update chamber
    const updateChamberData = await chambersHelpers.updateChamber({
        id: chamberId, name, phone, rent, type, property, description
    });
    return res.send(updateChamberData);
};

// DELETE: Archive chamber
module.exports.archiveChamber = async (req, res) => {
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
