const express = require('express');
const router = express.Router();

const {pictureMiddleware} = require("../../../middlewares/mediaMiddleware");
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const chambersController = require('../../../controllers/property/chambersController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get('', [tokenMiddleware, basicPermissionMiddleware], chambersController.chambers);
router.put('/create', [tokenMiddleware, basicPermissionMiddleware], chambersController.create);
router.get('/:chamberId/goods', [tokenMiddleware, basicPermissionMiddleware], chambersController.goods);
router.get('/:chamberId/detail', [tokenMiddleware, basicPermissionMiddleware], chambersController.chamber);
router.post('/:chamberId/info-update', [tokenMiddleware, basicPermissionMiddleware], chambersController.updateInfo);
router.delete('/:chamberId/delete', [tokenMiddleware, basicPermissionMiddleware], chambersController.deleteChamber);
router.put('/:chamberId/picture-add', [pictureMiddleware, tokenMiddleware, basicPermissionMiddleware], chambersController.addPicture);
router.delete('/:chamberId/picture-delete/:pictureId', [tokenMiddleware, basicPermissionMiddleware], chambersController.deletePicture);

module.exports = router;
