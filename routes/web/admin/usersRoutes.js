const express = require('express');
const router = express.Router();

const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const usersController = require('../../../controllers/admin/usersController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get(
    '/caretakers',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    usersController.caretakers
);
router.get(
    '/users',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    usersController.users
);
router.put(
    '/create',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    usersController.create
);
router.put(
    '/create-caretaker',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    usersController.createCaretaker
);

module.exports = router;
