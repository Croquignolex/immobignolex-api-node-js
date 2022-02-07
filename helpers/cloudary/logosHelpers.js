const filesHelpers = require('./filesHelpers');
const generalHelpers = require("../generalHelpers");
const companyHelpers = require('../mongodb/companyHelpers');

// Upload company logo to cloud
module.exports.cloudUpdateCompanyLogo = async (company, file) => {
    // Data
    const filePath = file.path;
    const oldCompanyLogo = company.logo;

    // Upload file to cloud & delete temp file
    const fileHelperData = await filesHelpers.cloudAddFile(filePath, 'immobignolex/logos/');
    await generalHelpers.deleteFileFromPath(filePath);
    if(!fileHelperData.status) {
        return fileHelperData;
    }

    // Delete old image in cloud if exist
    if(oldCompanyLogo) {
        await filesHelpers.cloudRemoveFile(oldCompanyLogo.id);
    }

    // Keep into database
    const newCompanyLogo = fileHelperData.data;
    const logo = {
        url: newCompanyLogo.url,
        id: newCompanyLogo.public_id,
        secure: newCompanyLogo.secure_url,
    };
    return await companyHelpers.updateCompanyLogo(logo);
};
