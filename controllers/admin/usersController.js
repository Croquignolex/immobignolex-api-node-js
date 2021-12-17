const errorConstants = require("../../constants/errorConstants");
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
    const {name, phone, email, role, description} = req.body;

    // Database saving
    return res.send(await saveUser({
        name: name.trim(), phone, email, description, role, creator: username
    }));
};

// PUT: Create create care taker
module.exports.createCaretaker = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, email, description} = req.body;
    // Database saving
    return res.send(await saveUser({
        name: name.trim(), phone, email, description, role: careTakerRole, creator: username
    }));
};

// Save user into database
const saveUser = async ({name, phone, email, description, role, creator}) => {
    // Build username & check
    const username = name?.split(' ')?.join("_")?.toLowerCase();
    const atomicUserFetchData = await usersHelpers.atomicUserFetch({username});
    if(atomicUserFetchData.status) {
        return {status: false, data: null, message: errorConstants.USERS.USER_ALREADY_EXIST};
    }

    // Create caretaker
    return await usersHelpers.createUser({
        name, phone, email, description, username, role, creator
    });
};
