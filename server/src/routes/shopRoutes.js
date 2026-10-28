const express = require('express');
const router = express.Router();
const { getShops, getShopById, getMyShop, updateShop } = require('../controllers/shopController');
const { getMenuByShop } = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getShops);
router.get('/my/shop', protect, authorize('shop_owner'), getMyShop);
router.get('/:id', getShopById);
router.get('/:id/menu', getMenuByShop);
router.put('/:id', protect, authorize('shop_owner'), updateShop);

module.exports = router;
