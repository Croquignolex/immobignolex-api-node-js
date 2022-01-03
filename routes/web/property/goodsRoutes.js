const express = require('express');
const router = express.Router();

const {pictureMiddleware} = require("../../../middlewares/mediaMiddleware");
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const goodsController = require('../../../controllers/property/goodsController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get('', [tokenMiddleware, basicPermissionMiddleware], goodsController.goods);
router.put('/create', [tokenMiddleware, basicPermissionMiddleware], goodsController.create);
router.get('/:goodId/detail', [tokenMiddleware, basicPermissionMiddleware], goodsController.good);
router.delete('/:goodId/archive', [tokenMiddleware, basicPermissionMiddleware], goodsController.archiveGood);
router.post('/:goodId/info-update', [tokenMiddleware, basicPermissionMiddleware], goodsController.updateInfo);
router.put('/:goodId/picture-add', [pictureMiddleware, tokenMiddleware, basicPermissionMiddleware], goodsController.addPicture);
router.delete('/:goodId/picture-delete/:pictureId', [tokenMiddleware, basicPermissionMiddleware], goodsController.deletePicture);

module.exports = router;
