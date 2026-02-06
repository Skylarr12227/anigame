const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const huntController = require('../controllers/huntController');

router.get('/status', authController.verifyToken, huntController.getHuntStatus);

module.exports = router;