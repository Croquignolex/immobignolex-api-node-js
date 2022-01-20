const dayjs = require("dayjs");

const generalHelpers = require("../../helpers/generalHelpers");
const errorConstants = require("../../constants/errorConstants");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
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

    // Check rent format
    const rentCheck = parseInt(rent, 10);
    if(!rentCheck) {
        return res.send({data: null, status: false, message: errorConstants.LEASES.WRONG_LEASE_RENT});
    }

    // Check surety format
    const suretyCheck = parseInt(surety, 10);
    if(!suretyCheck) {
        return res.send({data: null, status: false, message: errorConstants.LEASES.WRONG_LEASE_SURETY});
    }

    // Check deposit format
    const depositCheck = parseInt(rent, 10);
    if(!depositCheck) {
        return res.send({data: null, status: false, message: errorConstants.LEASES.WRONG_LEASE_DEPOSIT});
    }

    // Check start date with regex (date format)

    // Check lease period & retrieve rank
    const leasePeriodRank = generalHelpers.periodsTypesRank(leasePeriod);
    if(!leasePeriodRank) {
        return res.send({data: null, status: false, message: errorConstants.LEASES.WRONG_LEASE_PERIOD});
    }

    // Check rent period & retrieve rank
    const rentPeriodRank = generalHelpers.periodsTypesRank(rentPeriod);
    if(!rentPeriodRank) {
        return res.send({data: null, status: false, message: errorConstants.CHAMBERS.WRONG_RENT_PERIOD});
    }

    // Check rent period toward lease period
    if(rentPeriodRank > leasePeriodRank) {
        return res.send({data: null, status: false, message: errorConstants.LEASES.RENT_PERIOD_TOO_BIG});
    }

    // Check lease start date
    if(!dayjs(leaseStartDate).isValid()) {
        return res.send({data: null, status: false, message: errorConstants.LEASES.WRONG_LEASE_START_DATE});
    }

    // Check property chamber
    const propertyHasChamberData = await chambersHelpers.propertyHasChamber(property, chamber);
    if(!propertyHasChamberData.status) {
        return res.send({...propertyHasChamberData, message: errorConstants.CHAMBERS.WRONG_CHAMBER_PROPERTY});
    }

    // Check tenant
    const userByUsernameData = await usersHelpers.userByUsername(tenant);
    if(!userByUsernameData.status) {
        return res.send(userByUsernameData);
    }

    // Database saving
    return res.send(await leasesHelpers.createLease({
        commercial, property, chamber, tenant, leasePeriod, rentPeriod, leaseStartDate, description,
        rent: rentCheck, surety: suretyCheck, deposit: depositCheck, creator: username
    }));
};
