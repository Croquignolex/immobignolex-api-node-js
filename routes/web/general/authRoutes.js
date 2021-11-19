const express = require('express');
const router = express.Router();

const controller = require('../../../controllers/general/authController');
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const userPermissionMiddleware = require("../../../middlewares/userPermissionMiddleware");

router.post('/login', controller.login);
router.post('/logout', [tokenMiddleware, userPermissionMiddleware], controller.logout);

module.exports = router;
