const express = require('express');
const router = express.Router();

const {pictureMiddleware} = require("../../../middlewares/mediaMiddleware");
const userController = require('../../../controllers/general/userController');
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.post(
    '/avatar-update',
    [
        pictureMiddleware,
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    userController.updateAvatar
);
router.delete(
    '/avatar-delete',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    userController.deleteAvatar
);
router.post(
    '/info-update',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    userController.updateInfo
);

module.exports = router;
