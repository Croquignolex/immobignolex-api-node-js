const express = require('express');
const router = express.Router();

const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const rentsController = require('../../../controllers/management/rentsController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get('', [tokenMiddleware, basicPermissionMiddleware], rentsController.rents);
// router.get('/:leaseId/detail', [tokenMiddleware, basicPermissionMiddleware], leasesController.lease);

module.exports = router;