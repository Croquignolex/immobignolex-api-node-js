const multer = require("multer");

const generalHelpers = require("../helpers/generalHelpers");
const errorConstants = require("../constants/errorConstants");

// Store image
const imageStorage = multer.diskStorage({
    destination: (req, file, callback) => {
        const dir = "medias";
        callback(null, dir);
    },
    filename: (req, file, callback) => {
        callback(null, generalHelpers.generateRandomString() + '.jpg');
    }
});

// Image filter type
const imageFilter = function(req, file, callback) {
    // Accept jpg image files only
    if (['image/jpg', 'image/jpeg', 'image/png'].includes(file.mimetype)) callback(null, true)
    else {
        req.picture = errorConstants.GENERAL.PICTURE_TYPE;
        callback(null, false);
    }
};

module.exports = {
    pictureMiddleware: multer({
        storage: imageStorage,
        fileFilter: imageFilter
    }).single('picture')
};
