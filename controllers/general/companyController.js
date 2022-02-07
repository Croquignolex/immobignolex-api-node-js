const errorConstants = require('../../constants/errorConstants');
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const logosHelpers = require('../../helpers/cloudary/logosHelpers');

// POST: Update company logo
module.exports.updateLogo = async (req, res) => {
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

    // Get user by username
    const username = req.username;
    const userByUsernameData = await usersHelpers.userByUsername(username);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Save user avatar in the cloud & database
    const databaseUser = userByUsernameData.data;
    return res.send(await logosHelpers.cloudUpdateCompanyLogo(databaseUser, file));
};

// POST: Update user info
module.exports.updateInfo = async (req, res) => {
    // Form data & data
    const username = req.username;
    const {name, phone, email, description} = req.body;

    // Form checker
    if(!formCheckerHelpers.requiredChecker(name)) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Save user info in the database
    return res.send(await usersHelpers.updateUserInfo({
        username, name, phone, email, description
    }));
};
