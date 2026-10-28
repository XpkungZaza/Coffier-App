const Shop = require('../models/Shop');

// ฟังก์ชันคำนวณระยะทาง Haversine Formula (กิโลเมตร)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // รัศมีโลกในหน่วย กม.
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // ทศนิยม 1 ตำแหน่ง
}

// @desc   ดึงรายการร้านกาแฟทั้งหมด (พร้อมคำนวณระยะทางหากระบุพิกัด)
// @route  GET /api/shops
const getShops = async (req, res) => {
  try {
    const { userLat, userLng, search } = req.query;
    let query = {};

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const shops = await Shop.find(query).populate('ownerId', 'name email phone');

    // คำนวณระยะทางหากมีพิกัดของผู้ใช้ส่งมา (หรือใช้พิกัดสมมติในเชียงใหม่)
    const baseLat = userLat ? parseFloat(userLat) : 18.7904;
    const baseLng = userLng ? parseFloat(userLng) : 98.9847;

    const shopsWithDistance = shops.map((shop) => {
      const distance = calculateDistance(
        baseLat,
        baseLng,
        shop.location.lat,
        shop.location.lng
      );
      return {
        ...shop.toObject(),
        distanceKm: distance,
      };
    });

    // เรียงตามระยะทางจากใกล้ไปไกล
    shopsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    res.json({ success: true, shops: shopsWithDistance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   ดึงข้อมูลร้านกาแฟตาม ID
// @route  GET /api/shops/:id
const getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).populate('ownerId', 'name email phone');
    if (!shop) {
      return res.status(404).json({ success: false, message: 'ไม่พบร้านกาแฟนี้' });
    }
    res.json({ success: true, shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   ดึงข้อมูลร้านของเจ้าของร้านปัจจุบัน
// @route  GET /api/shops/my/shop
const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ ownerId: req.user._id });
    if (!shop) {
      return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลร้านของคุณ' });
    }
    res.json({ success: true, shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   อัปเดตข้อมูลร้านกาแฟ
// @route  PUT /api/shops/:id
const updateShop = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, message: 'ไม่พบร้านกาแฟนี้' });
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'คุณไม่ใช่เจ้าของร้านนี้' });
    }

    const { name, address, location, openTime, closeTime, image, phone, description, isOpen } = req.body;

    if (name) shop.name = name;
    if (address) shop.address = address;
    if (location) shop.location = location;
    if (openTime) shop.openTime = openTime;
    if (closeTime) shop.closeTime = closeTime;
    if (image) shop.image = image;
    if (phone) shop.phone = phone;
    if (description) shop.description = description;
    if (isOpen !== undefined) shop.isOpen = isOpen;

    await shop.save();
    res.json({ success: true, message: 'อัปเดตข้อมูลร้านสำเร็จ', shop });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getShops, getShopById, getMyShop, updateShop };
