const express = require('express');
const router = express.Router();

const controller = require('../../../controllers/general/authController');

router.post('/login', controller.login);

module.exports = router;
