const rentsHelpers = require("../../helpers/mongodb/rentsHelpers");

// GET: All rents
module.exports.rents = async (req, res) => {
    return res.send(await rentsHelpers.rentsWithChamberAndPropertyAndTenantAndLease());
};
