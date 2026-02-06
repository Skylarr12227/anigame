const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router.get('/profile', authController.verifyToken, userController.getProfile);
router.get('/collection', authController.verifyToken, userController.getCollection);
router.get('/animal/:id', authController.verifyToken, userController.getAnimal);
router.patch('/animal/:id/rename', authController.verifyToken, userController.renameAnimal);
router.delete('/animal/:id', authController.verifyToken, userController.releaseAnimal);
router.post('/team', authController.verifyToken, userController.updateTeam);
router.get('/leaderboard', userController.getLeaderboard);
router.post('/heal', authController.verifyToken, userController.healAll);

module.exports = router;