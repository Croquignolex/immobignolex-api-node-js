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
    '/administrators',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    usersController.administrators
);

module.exports = router;
