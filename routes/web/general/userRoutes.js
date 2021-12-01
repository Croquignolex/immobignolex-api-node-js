const express = require('express');
const router = express.Router();

const userController = require('../../../controllers/general/userController');
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.post('/avatar-update', [tokenMiddleware, basicPermissionMiddleware], userController.updateAvatar);
router.delete('/avatar-delete', [tokenMiddleware, basicPermissionMiddleware], userController.deleteAvatar);

module.exports = router;
