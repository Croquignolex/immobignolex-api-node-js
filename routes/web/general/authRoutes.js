const express = require('express');
const router = express.Router();

const controller = require('../../../controllers/general/authController');

const {login} = controller;

router.post('/login', login);

module.exports = router;
