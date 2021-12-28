const express = require('express');
const router = express.Router();

const {pictureMiddleware} = require("../../../middlewares/mediaMiddleware");
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const usersController = require('../../../controllers/admin/usersController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get('/tenants', [tokenMiddleware, basicPermissionMiddleware], usersController.tenants);
router.put('/tenants/create', [tokenMiddleware, basicPermissionMiddleware], usersController.createTenant);

router.get('/employees', [tokenMiddleware, basicPermissionMiddleware], usersController.employees);
router.put('/employees/create', [tokenMiddleware, basicPermissionMiddleware], usersController.createEmployee);

router.get('/administrators', [tokenMiddleware, basicPermissionMiddleware], usersController.administrators);
router.put('/administrators/create', [tokenMiddleware, basicPermissionMiddleware], usersController.createAdministrator);

router.get('/:username/detail', [tokenMiddleware, basicPermissionMiddleware], usersController.user);
router.post('/:username/info-update', [tokenMiddleware, basicPermissionMiddleware], usersController.updateInfo);
router.post('/:username/status-toggle', [tokenMiddleware, basicPermissionMiddleware], usersController.toggleStatus);
router.post('/:username/password-reset', [tokenMiddleware, basicPermissionMiddleware], usersController.resetPassword);
router.delete('/:username/avatar-delete', [tokenMiddleware, basicPermissionMiddleware], usersController.deleteAvatar);
router.post('/:username/update-avatar', [pictureMiddleware, tokenMiddleware, basicPermissionMiddleware], usersController.updateAvatar);

module.exports = router;
