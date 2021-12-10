const chambersHelpers = require("../../helpers/mongodb/chambersHelpers");

// GET: All chambers
module.exports.chambers = async (req, res) => {
    // Get chambers
    const chambersData = await chambersHelpers.chambers();
    return res.send(chambersData);
};
