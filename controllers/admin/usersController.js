const usersHelpers = require("../../helpers/mongodb/usersHelpers");

// GET: caretakers
module.exports.caretakers = async (req, res) => {
    // Get caretakers
    const usersData = await usersHelpers.usersByRole("Concierge");
    return res.send(usersData);
};

// GET: administrators
module.exports.administrators = async (req, res) => {
    // Get caretakers
    const usersData = await usersHelpers.usersByRole("Administrateur");
    return res.send(usersData);
};

