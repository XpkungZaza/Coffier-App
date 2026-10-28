const express = require('express');
const router = express.Router();
const { getSalesReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('shop_owner'));

router.get('/sales', getSalesReport);

module.exports = router;
