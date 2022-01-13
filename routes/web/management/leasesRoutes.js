const express = require('express');
const router = express.Router();

const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const leasesController = require('../../../controllers/management/leasesController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get('', [tokenMiddleware, basicPermissionMiddleware], leasesController.leases);
router.put('/create', [tokenMiddleware, basicPermissionMiddleware], leasesController.create);

module.exports = router;