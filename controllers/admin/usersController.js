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

    // Get role permissions
    const atomicRoleFetchData = await rolesHelpers.atomicRoleFetch({name: role});
    if(!atomicRoleFetchData.status) {
        return res.send(atomicRoleFetchData);
    }

    // Database saving
    const permissions = atomicRoleFetchData.permissions;
    return res.send(await saveUser({
        name: name.trim(), phone, email, description, role, permissions, creator: username
    }));
};

// PUT: Create create care taker
module.exports.createCaretaker = async (req, res) => {
    // Form data
    const username = req.username;
    const {name, phone, email, description} = req.body;

    // Get role permissions
    const atomicRoleFetchData = await rolesHelpers.atomicRoleFetch({name: careTakerRole});
    if(!atomicRoleFetchData.status) {
        return res.send(atomicRoleFetchData);
    }

    // Database saving
    const permissions = atomicRoleFetchData.permissions;
    return res.send(await saveUser({
        name: name.trim(), phone, email, description, permissions, role: careTakerRole, creator: username
    }));
};

// Save user into database
const saveUser = async ({name, phone, email, description, role, permissions, creator}) => {
    // Build username & check
    const username = name?.split(' ')?.join("_")?.toLowerCase();
    const atomicUserFetchData = await usersHelpers.atomicUserFetch({username});
    if(atomicUserFetchData.status) {
        return {status: false, data: null, message: errorConstants.USERS.USER_ALREADY_EXIST};
    }

    // Data
    const enable = true;
    const created_by = creator;
    const created_at = new Date();
    const bcrypt = require("bcryptjs");
    const password = await bcrypt.hash("000000", 10);

    // Create caretaker
    return await usersHelpers.atomicUserCreate({
        username, name, password, enable, phone, email, role,
        description, permissions, created_by, created_at
    });
};
