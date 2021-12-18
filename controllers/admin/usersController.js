const errorConstants = require("../../constants/errorConstants");
const usersHelpers = require("../../helpers/mongodb/usersHelpers");
const rolesHelpers = require("../../helpers/mongodb/rolesHelpers");

// Data
const careTakerRole = "Concierge";

// GET: caretakers
module.exports.caretakers = async (req, res) => {
    // Request data
    const username = req.username;

    // Get caretakers
    const atomicUsersFetchData = await usersHelpers.atomicUsersFetch({
        role: careTakerRole, enable: true, username: {$ne: username}
    });
    return res.send(atomicUsersFetchData);
};

// GET: users
module.exports.users = async (req, res) => {
    // Request data
    const username = req.username;

    // Get users
    const atomicUsersFetchData = await usersHelpers.atomicUsersFetch({
        enable: true, username: {$ne: username}
    });
    return res.send(atomicUsersFetchData);
};

// PUT: Create create user
module.exports.create = async (req, res) => {
    // Form data & data
    const username = req.username;
    const {name, phone, email, role, description} = req.body;


    // Database saving
    return res.send(await usersHelpers.createUser({
        name: name.trim(), phone, email, description, role, creator: username
    }));
};

// PUT: Create create care taker
module.exports.createCaretaker = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, email, description} = req.body;

    // Database saving
    return res.send(await usersHelpers.createUser({
        name: name.trim(), phone, email, description, role: careTakerRole, creator: username
    }));
};
