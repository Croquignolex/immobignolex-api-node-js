const usersHelpers = require("../../helpers/mongodb/usersHelpers");

// GET: All users
module.exports.users = async (req, res) => {
    // Get users
    const usersData = await usersHelpers.usersWithProperties();
    return res.send(usersData);
};
