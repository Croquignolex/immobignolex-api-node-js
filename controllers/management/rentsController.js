const rentsHelpers = require("../../helpers/mongodb/rentsHelpers");
const leasesHelpers = require("../../helpers/mongodb/leasesHelpers");

// GET: All rents
module.exports.rents = async (req, res) => {
    return res.send(await rentsHelpers.rentsWithChamberAndPropertyAndTenantAndLease());
};

/*// GET: Lease
module.exports.rent = async (req, res) => {
    // Route params
    const {leaseId} = req.params;
    return res.send(await leasesHelpers.leaseByIdWithChamberAndPropertyAndTenantAndCreator(leaseId));
};*/
