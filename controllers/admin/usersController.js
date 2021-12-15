const usersHelpers = require("../../helpers/mongodb/usersHelpers");

// Data
const careTakerRole = "Concierge";

// GET: caretakers
module.exports.caretakers = async (req, res) => {
    // Get caretakers
    const usersData = await usersHelpers.usersByRoleWithProperties(careTakerRole);
    return res.send(usersData);
};

// GET: users
module.exports.users = async (req, res) => {
    // Get users
    const usersData = await usersHelpers.usersWithProperties();
    return res.send(usersData);
};

// PUT: Create create user
module.exports.create = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, email, description} = req.body;

    // Create user
    const createUserData = await usersHelpers.createUser({
        name, phone, email, description, role: careTakerRole, creator: username
    });
    return res.send(createUserData);
};

// PUT: Create create care taker
module.exports.createCaretaker = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, email, role, description} = req.body;

    // Create caretaker
    const createUserData = await usersHelpers.createUser({
        name, phone, email, description, role, creator: username
    });
    return res.send(createUserData);
};

