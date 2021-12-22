const usersHelpers = require("../../helpers/mongodb/usersHelpers");

// GET: caretakers
module.exports.caretakers = async (req, res) => {
    // Request data
    const username = req.username;

    // Get caretakers
    const caretakersWithoutUserByUsernameData = await usersHelpers.caretakersWithoutUserByUsername(username);
    return res.send(caretakersWithoutUserByUsernameData);
};

// GET: users
module.exports.users = async (req, res) => {
    // Request data
    const username = req.username;

    // Get caretakers
    const usersWithoutUserByUsernameData = await usersHelpers.usersWithoutUserByUsername(username);
    return res.send(usersWithoutUserByUsernameData);
};

// GET: User
module.exports.user = async (req, res) => {
    // Route params
    const {username} = req.params;

    // Get user
    const userByUsernameData = await usersHelpers.userByUsername(username);
    return res.send(userByUsernameData);
};

// PUT: Create create user
module.exports.create = async (req, res) => {
    // Form data & data
    const username = req.username;
    const {name, phone, email, role, description} = req.body;

    // Database saving
    const createUserData = await usersHelpers.createUser({
        name: name.trim(), phone, email, description, role, creator: username
    });
    return res.send(createUserData);
};

// PUT: Create create care taker
module.exports.createCaretaker = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, email, description} = req.body;

    // Database saving
    const createCaretakerData = await usersHelpers.createCaretaker({
        name: name.trim(), phone, email, description, creator: username
    });
    return res.send(createCaretakerData);
};
