const express = require('express');
const router = express.Router();

const {pictureMiddleware} = require("../../../middlewares/mediaMiddleware");
const userController = require('../../../controllers/general/userController');
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.post('/info-update', [tokenMiddleware, basicPermissionMiddleware], userController.updateInfo);
router.delete('/avatar-delete', [tokenMiddleware, basicPermissionMiddleware], userController.deleteAvatar);
router.post('/password-update', [tokenMiddleware, basicPermissionMiddleware], userController.updatePassword);
router.post('/avatar-update', [pictureMiddleware, tokenMiddleware, basicPermissionMiddleware], userController.updateAvatar);

module.exports = router;
