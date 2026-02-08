const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const { validationRules, validate } = require('../middleware/validationMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.get('/dashboard/stats', adminController.getDashboardStats);

router.post('/users', validationRules.addUser, validate, adminController.addUser);
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);

router.post('/stores', validationRules.addStore, validate, adminController.addStore);
router.get('/stores', adminController.getStores);

module.exports = router;
