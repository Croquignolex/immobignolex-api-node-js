const errorConstants = require('../../constants/errorConstants');
const logosHelpers = require('../../helpers/cloudary/logosHelpers');
const companyHelpers = require("../../helpers/mongodb/companyHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");

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

    // Get company
    const companyData = await companyHelpers.company();
    if(!companyData.status) {
        return res.send(companyData);
    }

    // Save user avatar in the cloud & database
    const databaseCompany = companyData.data;
    return res.send(await logosHelpers.cloudUpdateCompanyLogo(databaseCompany, file));
};

// POST: Update user info
module.exports.updateInfo = async (req, res) => {
    // Form data & data
    const {
        name, owner, address,
        phone, email, accountBank,
        accountName, accountNumber, accountIban
    } = req.body;

    // Form checker
    if(!formCheckerHelpers.requiredChecker(name)) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Save company info in the database
    return res.send(await companyHelpers.updateCompanyInfo({
        name, owner, address,
        phone, email, accountBank,
        accountName, accountNumber, accountIban
    }));
};
