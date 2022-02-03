const express = require('express');
const router = express.Router();

const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const paymentsController = require('../../../controllers/management/paymentsController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.get('', [tokenMiddleware, basicPermissionMiddleware], paymentsController.payments);
// router.get('/:leaseId/detail', [tokenMiddleware, basicPermissionMiddleware], leasesController.lease);

module.exports = router;
