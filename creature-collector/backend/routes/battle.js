const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const battleController = require('../controllers/battleController');

router.post('/create', authController.verifyToken, battleController.createBattle);
router.get('/active', authController.verifyToken, battleController.getActiveBattles);
router.get('/:id', authController.verifyToken, battleController.getBattle);

module.exports = router;