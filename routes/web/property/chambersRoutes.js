const express = require('express');
const router = express.Router();

const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const chambersController = require('../../../controllers/property/chambersController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get('', [tokenMiddleware, basicPermissionMiddleware], chambersController.chambers);
router.put('/create', [tokenMiddleware, basicPermissionMiddleware], chambersController.create);
router.get('/:chamberId/detail', [tokenMiddleware, basicPermissionMiddleware], chambersController.chamber);
router.delete('/:chamberId/archive', [tokenMiddleware, basicPermissionMiddleware], chambersController.archiveChamber);
router.put('/:propertyId/picture-add', [pictureMiddleware, tokenMiddleware, basicPermissionMiddleware], propertiesController.addPicture);
router.delete('/:propertyId/picture-delete/:pictureId', [tokenMiddleware, basicPermissionMiddleware], propertiesController.deletePicture);

/*


router.post('/:propertyId/info-update', [tokenMiddleware, basicPermissionMiddleware], propertiesController.updateInfo);


 */

module.exports = router;
