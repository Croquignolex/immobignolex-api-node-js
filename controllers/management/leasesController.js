const leasesHelpers = require("../../helpers/mongodb/leasesHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
const errorConstants = require("../../constants/errorConstants");
const chambersHelpers = require("../../helpers/mongodb/chambersHelpers");

// GET: All leases
module.exports.leases = async (req, res) => {
    // Get leases
    const leasesData = await leasesHelpers.leases();
    return res.send(leasesData);
};

// PUT: Create lease
module.exports.create = async (req, res) => {
    // Form data & data
    const username = req.username;
    const {name, phone, rent, type, property, description} = req.body;

    // Form checker
    if(
        !formCheckerHelpers.requiredChecker(rent) ||
        !formCheckerHelpers.requiredChecker(type) ||
        !formCheckerHelpers.requiredChecker(name) ||
        !formCheckerHelpers.requiredChecker(property)
    ) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Database saving
    const createChamberData = await chambersHelpers.createChamber({
        name, phone, type, property, description, creator: username, rent
    });
    return res.send(createChamberData);
};
