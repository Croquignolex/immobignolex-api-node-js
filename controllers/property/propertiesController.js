const errorConstants = require("../../constants/errorConstants");
const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");
const propertyPicturesHelpers = require("../../helpers/cloudary/propertyPicturesHelpers");

// GET: All properties
module.exports.properties = async (req, res) => {
    // Get properties
    const propertiesWithCaretakerData = await propertiesHelpers.propertiesWithCaretaker();
    return res.send(propertiesWithCaretakerData);
};

// GET: Property
module.exports.property = async (req, res) => {
    // Route params
    const {propertyId} = req.params;

    // Get property
    const propertyByIdWithCaretakerData = await propertiesHelpers.propertyByIdWithCaretaker(propertyId);
    return res.send(propertyByIdWithCaretakerData);
};

// PUT: Create property
module.exports.create = async (req, res) => {
    // Form data & data
    const username = req.username;
    const {name, phone, address, caretaker, description} = req.body;

    // Create property
    const createPropertyData = await propertiesHelpers.createProperty({
        name, phone, address, caretaker, description, creator: username
    });
    return res.send(createPropertyData);
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
    const cloudDeletePropertyPictureData = await propertyPicturesHelpers.cloudDeletePropertyPicture(propertyId, cloudPictureId);
    return res.send(cloudDeletePropertyPictureData);
};
