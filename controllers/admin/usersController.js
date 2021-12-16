const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const errorConstants = require("../../constants/errorConstants");

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
    const {name, phone, email, role, description} = req.body;

    // Build username & check
    const createdUsername = name.trim()?.split(' ')?.join("_")?.toLowerCase();
    const userByUsernameData = await usersHelpers.userByUsername(createdUsername);
    if(userByUsernameData.status) {
        return res.send({status: false, data: null, message: errorConstants.USERS.USER_ALREADY_EXIST});
    }

    // Create user
    const createUserData = await usersHelpers.createUser({
        name: name.trim(), phone, email, description, username: createdUsername, role, creator: username
    });
    return res.send(createUserData);
};

// PUT: Create create care taker
module.exports.createCaretaker = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, email, description} = req.body;

    // Build username & check
    const createdUsername = name.trim()?.split(' ')?.join("_")?.toLowerCase();
    const userByUsernameData = await usersHelpers.userByUsername(createdUsername);
    if(userByUsernameData.status) {
        return res.send({status: false, data: null, message: errorConstants.USERS.USER_ALREADY_EXIST});
    }

    // Create caretaker
    const createUserData = await usersHelpers.createUser({
        name: name.trim(), phone, email, description, username: createdUsername, role: careTakerRole, creator: username
    });
    return res.send(createUserData);
};

