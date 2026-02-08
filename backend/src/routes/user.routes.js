const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validationRules, validate } = require('../middleware/validationMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('user'));

router.get('/stores', userController.getStores);
router.get('/stores/:id', userController.getStoreDetails);

router.post('/ratings', validationRules.submitRating, validate, userController.submitRating);

module.exports = router;
