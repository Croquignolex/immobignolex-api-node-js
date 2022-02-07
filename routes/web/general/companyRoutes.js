const express = require('express');
const router = express.Router();

const {pictureMiddleware} = require("../../../middlewares/mediaMiddleware");
const tokenMiddleware = require("../../../middlewares/accessTokenMiddleware");
const companyController = require('../../../controllers/general/companyController');
const basicPermissionMiddleware = require("../../../middlewares/basicPermissionMiddleware");

router.post('/info-update', [tokenMiddleware, basicPermissionMiddleware], companyController.updateInfo);
router.post('/logo-update', [pictureMiddleware, tokenMiddleware, basicPermissionMiddleware], companyController.updateLogo);

module.exports = router;
