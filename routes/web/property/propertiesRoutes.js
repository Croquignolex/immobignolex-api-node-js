const express = require('express');
const router = express.Router();

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

module.exports = router;
