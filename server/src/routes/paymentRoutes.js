const express = require('express');
const router = express.Router();
const { processMockPayment, confirmMockPayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/mock', processMockPayment);
router.post('/confirm', confirmMockPayment);

module.exports = router;
