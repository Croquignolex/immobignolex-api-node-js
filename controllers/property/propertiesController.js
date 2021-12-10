const propertiesHelpers = require("../../helpers/mongodb/propertiesHelpers");

// GET: All properties
module.exports.properties = async (req, res) => {
    // Get properties
    const propertiesData = await propertiesHelpers.properties();
    console.log(propertiesData.data)
    return res.send(propertiesData);
};
