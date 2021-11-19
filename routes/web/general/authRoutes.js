const express = require('express');
const router = express.Router();

const controller = require('../../../controllers/general/authController');
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const refreshTokenMiddleware = require("../../../middlewares/refreshTokenMiddleware");
const userPermissionMiddleware = require("../../../middlewares/userPermissionMiddleware");

router.post('/login', controller.login);
router.post('/token', refreshTokenMiddleware, controller.token);
router.post('/logout', [tokenMiddleware, userPermissionMiddleware], controller.logout);
router.post('/refresh', [tokenMiddleware, userPermissionMiddleware], controller.refresh);

module.exports = router;
