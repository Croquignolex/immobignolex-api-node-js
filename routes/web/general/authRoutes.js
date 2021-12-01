const express = require('express');
const router = express.Router();

const authController = require('../../../controllers/general/authController');
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const refreshTokenMiddleware = require("../../../middlewares/refreshTokenMiddleware");
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.post('/login', authController.login);
router.post('/token', refreshTokenMiddleware, authController.token);
router.post('/logout', [tokenMiddleware, basicPermissionMiddleware], authController.logout);
router.post('/refresh', [tokenMiddleware, basicPermissionMiddleware], authController.refresh);

module.exports = router;
