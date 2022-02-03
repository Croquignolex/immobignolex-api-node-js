const paymentsHelpers = require("../../helpers/mongodb/paymentsHelpers");

// GET: All payments
module.exports.payments = async (req, res) => {
    return res.send(await paymentsHelpers.paymentsWithChamberAndPropertyAndTenantAndLeaseAndRent());
};

/*
// GET: Lease
module.exports.payment = async (req, res) => {
    // Route params
    const {leaseId} = req.params;
    return res.send(await leasesHelpers.leaseByIdWithChamberAndPropertyAndTenantAndCreator(leaseId));
};
*/
