const express = require('express');
const router = express.Router();

const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const usersController = require('../../../controllers/admin/usersController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get('/:username/detail', [tokenMiddleware, basicPermissionMiddleware], usersController.user);
router.get('/administrators', [tokenMiddleware, basicPermissionMiddleware], usersController.administrators);
router.put('/administrators/create', [tokenMiddleware, basicPermissionMiddleware], usersController.createAdministrator);

module.exports = router;
