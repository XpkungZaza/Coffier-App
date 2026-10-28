const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getShopOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createOrder);
router.get('/my', getMyOrders);
router.get('/shop', authorize('shop_owner'), getShopOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorize('shop_owner'), updateOrderStatus);

module.exports = router;
