const express = require('express');
const router = express.Router();

const {pictureMiddleware} = require("../../../middlewares/mediaMiddleware");
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const chambersController = require('../../../controllers/property/chambersController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get('', [tokenMiddleware, basicPermissionMiddleware], chambersController.chambers);
router.put('/create', [tokenMiddleware, basicPermissionMiddleware], chambersController.create);
router.get('/:chamberId/detail', [tokenMiddleware, basicPermissionMiddleware], chambersController.chamber);
router.delete('/:chamberId/archive', [tokenMiddleware, basicPermissionMiddleware], chambersController.archiveChamber);
router.put('/:chamberId/picture-add', [pictureMiddleware, tokenMiddleware, basicPermissionMiddleware], chambersController.addPicture);
router.delete('/:chamberId/picture-delete/:pictureId', [tokenMiddleware, basicPermissionMiddleware], chambersController.deletePicture);

/*


router.post('/:propertyId/info-update', [tokenMiddleware, basicPermissionMiddleware], propertiesController.updateInfo);


 */

module.exports = router;
