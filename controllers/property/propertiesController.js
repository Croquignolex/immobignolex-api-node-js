const errorConstants = require("../../constants/errorConstants");
const goodsHelpers = require("../../helpers/mongodb/goodsHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const chambersHelpers = require("../../helpers/mongodb/chambersHelpers");
const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");
const propertyPicturesHelpers = require("../../helpers/cloudary/propertyPicturesHelpers");

// GET: All properties
module.exports.properties = async (req, res) => {
    return res.send(await propertiesHelpers.properties());
};

// GET: Property
module.exports.property = async (req, res) => {
    // Route params
    const {propertyId} = req.params;
    return res.send(await propertiesHelpers.propertyByIdWithCreator(propertyId));
};

// PUT: Create property
module.exports.create = async (req, res) => {
    // Form data & data
    const username = req.username;
    const {name, phone, address, description} = req.body;

    // Form checker
    if(!formCheckerHelpers.requiredChecker(name)) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Database saving
    return res.send(await propertiesHelpers.createProperty({
        name, phone, address, description, creator: username
    }));
};

// POST: Update property info
module.exports.updateInfo = async (req, res) => {
    // Form data & data
    const {propertyId} = req.params;
    const {name, phone, address, description} = req.body;

    // Form checker
    if(!formCheckerHelpers.requiredChecker(name)) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Update property
    return res.send(await propertiesHelpers.updateProperty({
        id: propertyId, name, phone, address, description
    }));
};

// DELETE: delete property
module.exports.deleteProperty = async (req, res) => {
    // Form data & data
    const {propertyId} = req.params;
    return res.send(await propertiesHelpers.deletePropertyByPropertyId(propertyId));
};

// PUT: Add property picture
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

    // Save property picture in the cloud & database
    const {propertyId} = req.params;
    return res.send(await propertyPicturesHelpers.cloudAddPropertyPicture(propertyId, file));
};

// DELETE: Delete property picture
module.exports.deletePicture = async (req, res) => {
    // Route params
    const {propertyId, pictureId} = req.params;
    const cloudPictureId = pictureId.split('-').join('/');

    // Remove picture in the cloud & database
    return res.send(await propertyPicturesHelpers.cloudRemovePropertyPicture(propertyId, cloudPictureId));
};

// GET: Property chambers chambers
module.exports.chambers = async (req, res) => {
    // Route params
    const {free} = req.query;
    const {propertyId} = req.params;

    // Fetch correspondent chambers
    if(free) return res.send(await chambersHelpers.propertyFreeChambers(propertyId));
    return res.send(await chambersHelpers.propertyChambers(propertyId));
};

// GET: Property goods chambers
module.exports.goods = async (req, res) => {
    // Route params
    const {propertyId} = req.params;
    return res.send(await goodsHelpers.propertyGoods(propertyId));
};
