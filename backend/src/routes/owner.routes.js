const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware('owner'));

router.get('/dashboard', ownerController.getDashboard);
router.get('/stores/:storeId/ratings', ownerController.getStoreRatings);

module.exports = router;
