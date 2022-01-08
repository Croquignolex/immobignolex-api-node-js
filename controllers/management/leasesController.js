const leasesHelpers = require("../../helpers/mongodb/leasesHelpers");

// GET: All leases
module.exports.leases = async (req, res) => {
    // Get leases
    const leasesData = await leasesHelpers.leases();
    return res.send(leasesData);
};
