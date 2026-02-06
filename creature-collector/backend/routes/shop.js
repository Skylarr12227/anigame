const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const shopController = require('../controllers/shopController');

router.get('/', authController.verifyToken, shopController.getShop);
router.get('/inventory', authController.verifyToken, shopController.getInventory);
router.post('/buy', authController.verifyToken, shopController.buyItem);
router.post('/sell', authController.verifyToken, shopController.sellItem);
router.post('/use', authController.verifyToken, shopController.useItem);
router.post('/equip', authController.verifyToken, shopController.equipItem);
router.post('/unequip', authController.verifyToken, shopController.unequipItem);

module.exports = router;