const paymentsHelpers = require("../../helpers/mongodb/paymentsHelpers");

// GET: All payments
module.exports.payments = async (req, res) => {
    return res.send(await paymentsHelpers.paymentsWithChamberAndPropertyAndTenantAndLeaseAndRent());
};

// GET: Payment
module.exports.payment = async (req, res) => {
    // Route params
    const {paymentId} = req.params;
    return res.send(await paymentsHelpers.paymentByIdWithChamberAndPropertyAndTenantAndLeaseAndRentAndCreator(paymentId));
};
