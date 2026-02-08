const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authMiddleware');
const { validationRules, validate } = require('../middleware/validationMiddleware');

router.post('/signup', validationRules.signup, validate, authController.signup);
router.post('/login', validationRules.login, validate, authController.login);

router.get('/me', authMiddleware, authController.getCurrentUser);
router.put('/update-password', authMiddleware, validationRules.updatePassword, validate, authController.updatePassword);

module.exports = router;
