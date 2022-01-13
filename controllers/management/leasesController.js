const errorConstants = require("../../constants/errorConstants");
const leasesHelpers = require("../../helpers/mongodb/leasesHelpers");
const formCheckerHelpers = require("../../helpers/formCheckerHelpers");
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
    const {commercial, property, chamber, tenant, leasePeriod, rentPeriod, rent, surety, deposit, leaseStartDate, description} = req.body;

    // Form checker
    if(
        !formCheckerHelpers.requiredChecker(rent) ||
        !formCheckerHelpers.requiredChecker(tenant) ||
        !formCheckerHelpers.requiredChecker(surety) ||
        !formCheckerHelpers.requiredChecker(chamber) ||
        !formCheckerHelpers.requiredChecker(deposit) ||
        !formCheckerHelpers.requiredChecker(property) ||
        !formCheckerHelpers.requiredChecker(rentPeriod) ||
        !formCheckerHelpers.requiredChecker(leasePeriod) ||
        !formCheckerHelpers.requiredChecker(leaseStartDate)
    ) {
        return res.send({status: false, message: errorConstants.GENERAL.FORM_DATA, data: null});
    }

    // Check property chamber
    const propertyHasChamberData = await chambersHelpers.propertyHasChamber(property, chamber);
    if(!propertyHasChamberData.status) {
        return res.send({...propertyHasChamberData, message: errorConstants.CHAMBERS.WRONG_CHAMBER_PROPERTY});
    }

    // check lease period from rent period

    // Database saving
    const createLeaseData = await leasesHelpers.createLease({
        commercial, property, chamber, tenant, leasePeriod, rentPeriod, rent, surety,
        deposit, leaseStartDate, description, creator: username
    });
    return res.send(createLeaseData);
};
