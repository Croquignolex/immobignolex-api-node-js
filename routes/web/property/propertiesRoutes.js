const express = require('express');
const router = express.Router();

const {pictureMiddleware} = require("../../../middlewares/mediaMiddleware");
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const propertiesController = require('../../../controllers/property/propertiesController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get(
    '',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    propertiesController.properties
);
router.put(
    '/create',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    propertiesController.create
);
router.put(
    '/:propertyId/picture-add',
    [
        pictureMiddleware,
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    propertiesController.addPicture
);
router.delete(
    '/:propertyId/picture-delete/:pictureId',
    [
        tokenMiddleware,
        basicPermissionMiddleware
    ],
    propertiesController.deletePicture
);

module.exports = router;
