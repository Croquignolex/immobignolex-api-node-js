const usersHelpers = require("../../helpers/mongodb/usersHelpers");

// Data
const careTakerRole = "Concierge";

// GET: caretakers
module.exports.caretakers = async (req, res) => {
    // Request data
    const username = req.username;

    // Get caretakers
    const usersByRoleData = await usersHelpers.usersByRole(careTakerRole, username);
    return res.send(usersByRoleData);
};

// GET: users
module.exports.users = async (req, res) => {
    // Request data
    const username = req.username;

    // Get users
    const usersData = await usersHelpers.users(username);
    return res.send(usersData);
};

// PUT: Create create user
module.exports.create = async (req, res) => {
    // Form data & data
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

