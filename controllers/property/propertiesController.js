const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");

// GET: All properties
module.exports.properties = async (req, res) => {
    // Get properties
    const propertiesData = await propertiesHelpers.propertiesWithCaretaker();
    return res.send(propertiesData);
};
