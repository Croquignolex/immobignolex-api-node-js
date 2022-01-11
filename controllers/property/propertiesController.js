const errorConstants = require("../../constants/errorConstants");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");
const propertyPicturesHelpers = require("../../helpers/cloudary/propertyPicturesHelpers");
const chambersHelpers = require("../../helpers/mongodb/chambersHelpers");

// GET: All properties
module.exports.properties = async (req, res) => {
    // Get properties
    const propertiesData = await propertiesHelpers.properties();
    return res.send(propertiesData);
};

// GET: Property
module.exports.property = async (req, res) => {
    // Route params
    const {propertyId} = req.params;

    // Get property
    const propertyByIdWithCreatorData = await propertiesHelpers.propertyByIdWithCreator(propertyId);
    return res.send(propertyByIdWithCreatorData);
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
    const createPropertyData = await propertiesHelpers.createProperty({
        name, phone, address, description, creator: username
    });
    return res.send(createPropertyData);
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
    const updatePropertyData = await propertiesHelpers.updateProperty({
        id: propertyId, name, phone, address, description
    });
    return res.send(updatePropertyData);
};

// DELETE: Archive property
module.exports.archiveProperty = async (req, res) => {
    // Form data & data
    const {propertyId} = req.params;

    // Update property visibility
    const archivePropertyByPropertyIdData = await propertiesHelpers.archivePropertyByPropertyId(propertyId);
    return res.send(archivePropertyByPropertyIdData);
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

    // Route params
    const {propertyId} = req.params;

    // Save property picture in the cloud & database
    const cloudAddPropertyPictureData = await propertyPicturesHelpers.cloudAddPropertyPicture(propertyId, file);
    return res.send(cloudAddPropertyPictureData);
};

// DELETE: Delete property picture
module.exports.deletePicture = async (req, res) => {
    // Route params
    const {propertyId, pictureId} = req.params;
    const cloudPictureId = pictureId.split('-').join('/');

    // Remove picture in the cloud & database
    const cloudRemovePropertyPictureData = await propertyPicturesHelpers.cloudRemovePropertyPicture(propertyId, cloudPictureId);
    return res.send(cloudRemovePropertyPictureData);
};

// GET: All chambers
module.exports.chambers = async (req, res) => {
    // Route params
    const {propertyId} = req.params;
    const {free} = req.query;

    if(free) {
        const propertyFreeChambersData = await chambersHelpers.propertyFreeChambers(propertyId);
        return res.send(propertyFreeChambersData);
    }

    // Get property chambers
    const propertyChambersData = await chambersHelpers.propertyChambers(propertyId);
    return res.send(propertyChambersData);
};
