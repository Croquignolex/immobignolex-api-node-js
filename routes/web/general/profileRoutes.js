const express = require('express');
const router = express.Router();

const {pictureMiddleware} = require("../../../middlewares/mediaMiddleware");
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const profileController = require('../../../controllers/general/profileController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.post('/info-update', [tokenMiddleware, basicPermissionMiddleware], profileController.updateInfo);
router.delete('/avatar-delete', [tokenMiddleware, basicPermissionMiddleware], profileController.deleteAvatar);
router.post('/password-update', [tokenMiddleware, basicPermissionMiddleware], profileController.updatePassword);
router.post('/avatar-update', [pictureMiddleware, tokenMiddleware, basicPermissionMiddleware], profileController.updateAvatar);

module.exports = router;
