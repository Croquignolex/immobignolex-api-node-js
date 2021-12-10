const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");

// GET: All properties
module.exports.properties = async (req, res) => {
    // Get properties
    const propertiesData = await propertiesHelpers.properties();
    return res.send(propertiesData);
};
