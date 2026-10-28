const MenuItem = require('../models/MenuItem');
const Shop = require('../models/Shop');

// @desc   ดึงรายการเมนูของร้านกาแฟ
// @route  GET /api/shops/:id/menu
const getMenuByShop = async (req, res) => {
  try {
    const { category, seasonalOnly, availableOnly } = req.query;
    let query = { shopId: req.params.id };

    if (category && category !== 'all') {
      query.category = category;
    }
    if (seasonalOnly === 'true') {
      query.isSeasonal = true;
    }
    if (availableOnly === 'true') {
      query.isAvailable = true;
    }

    const items = await MenuItem.find(query).sort({ category: 1, basePrice: 1 });
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   เพิ่มเมนูใหม่ (สำหรับร้านค้า)
// @route  POST /api/menu
const createMenuItem = async (req, res) => {
  try {
    const { name, category, categoryNameTh, beanType, basePrice, image, description, isSeasonal, shopId } = req.body;

    let targetShopId = shopId;
    if (!targetShopId) {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      if (!shop) {
        return res.status(404).json({ success: false, message: 'ไม่พบร้านค้าของคุณ กรุณาสร้างร้านก่อน' });
      }
      targetShopId = shop._id;
    }

    const newItem = await MenuItem.create({
      shopId: targetShopId,
      name,
      category: category || 'latte',
      categoryNameTh: categoryNameTh || 'กาแฟสด',
      beanType: beanType || 'Arabica',
      basePrice: Number(basePrice),
      image: image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600',
      description: description || '',
      isSeasonal: Boolean(isSeasonal),
      isAvailable: true,
    });

    res.status(201).json({ success: true, message: 'เพิ่มเมนูสำเร็จ', item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   แก้ไขเมนู (สำหรับร้านค้า)
// @route  PUT /api/menu/:id
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'ไม่พบเมนูนี้' });
    }

    const updatedItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'อัปเดตเมนูสำเร็จ', item: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   ลบเมนู (สำหรับร้านค้า)
// @route  DELETE /api/menu/:id
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'ไม่พบเมนูนี้' });
    }

    await item.deleteOne();
    res.json({ success: true, message: 'ลบเมนูเรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   เปิด/ปิดการจำหน่ายเมนูแบบรวดเร็ว
// @route  PATCH /api/menu/:id/toggle
const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'ไม่พบเมนูนี้' });
    }

    item.isAvailable = !item.isAvailable;
    await item.save();

    res.json({
      success: true,
      message: `เปลี่ยนสถานะเมนูเป็น ${item.isAvailable ? 'พร้อมจำหน่าย' : 'สินค้าหมดชั่วคราว'}`,
      isAvailable: item.isAvailable,
      item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMenuByShop,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
