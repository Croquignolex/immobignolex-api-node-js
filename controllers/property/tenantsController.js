const tenantsHelpers = require("../../helpers/mongodb/tenantsHelpers");

// GET: All tenants
module.exports.tenants = async (req, res) => {
    // Get tenants
    const tenantsData = await tenantsHelpers.tenants();
    return res.send(tenantsData);
};
