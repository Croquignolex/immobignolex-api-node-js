const express = require('express');
const router = express.Router();

const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const usersController = require('../../../controllers/admin/usersController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get(
    '',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    usersController.users
);

module.exports = router;
