const express = require('express');
const router = express.Router();
const {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require('../controllers/menuController');
const { protect, authorize } = require('../middleware/auth');

// ทุกเส้นทางด้านล่างต้องการสิทธิ์ shop_owner
router.use(protect, authorize('shop_owner'));

router.post('/', createMenuItem);
router.put('/:id', updateMenuItem);
router.delete('/:id', deleteMenuItem);
router.patch('/:id/toggle', toggleAvailability);

module.exports = router;
