const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Shop = require('../models/Shop');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Notification = require('../models/Notification');

const seedData = async (forceClean = false) => {
  try {
    const userCount = await User.countDocuments();
    if (!forceClean && userCount > 0) {
      console.log('[Seed] ข้อมูลในระบบพร้อมใช้งานแล้ว ข้ามขั้นตอนการ Seed');
      return;
    }

    if (forceClean) {
      await User.deleteMany({});
      await Shop.deleteMany({});
      await MenuItem.deleteMany({});
      await Order.deleteMany({});
      await Notification.deleteMany({});
      console.log('[Seed] ล้างข้อมูลเดิมเรียบร้อย');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. ผู้ใช้ทดสอบ
    const customerUser = await User.create({
      name: 'กิตติศักดิ์ ชัยมงคล (ลูกค้าทดสอบ)',
      email: 'customer@coffeecup.com',
      passwordHash,
      role: 'customer',
      phone: '081-234-5678',
      credit: 650,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
    });

    const ownerUser = await User.create({
      name: 'สมชาย คอฟฟี่มาสเตอร์ (เจ้าของร้าน)',
      email: 'owner@coffeecup.com',
      passwordHash,
      role: 'shop_owner',
      phone: '089-876-5432',
      credit: 0,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
    });

    // 2. ร้านกาแฟตัวอย่าง 3 ร้าน (เชียงใหม่ ตาม Concept Paper)
    const shopsData = [
      {
        name: 'Lanna Brew Coffee (ลานนา บรูว์)',
        ownerId: ownerUser._id,
        address: '9 ถ.เวียงแก้ว ต.ศรีภูมิ อ.เมือง จ.เชียงใหม่ (ใกล้วิทยาลัยเทคนิคเชียงใหม่)',
        location: { lat: 18.7904, lng: 98.9847 },
        openTime: '07:30',
        closeTime: '18:00',
        image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800',
        phone: '053-219-010',
        rating: 4.9,
        description: 'กาแฟอาราบิก้าแท้จากดอยช้าง คั่วสดใหม่ หอมกรุ่น บรรยากาศล้านนาโมเดิร์น',
      },
      {
        name: 'Mornings & Mint Cafe (มอร์นิ่งส์ แอนด์ มิ้นท์)',
        ownerId: ownerUser._id,
        address: '15/2 ถ.นิมมานเหมินท์ ซอย 9 ต.สุเทพ อ.เมือง จ.เชียงใหม่',
        location: { lat: 18.7968, lng: 98.9686 },
        openTime: '08:00',
        closeTime: '19:00',
        image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800',
        phone: '053-892-441',
        rating: 4.8,
        description: 'คาเฟ่สไตล์มินิมอล มีเมนูกาแฟสกัดเย็น Cold Brew และ Specialty Coffee ชั้นเลิศ',
      },
      {
        name: 'Bean Theory Specialty Coffee (บีน ธีโอรี่)',
        ownerId: ownerUser._id,
        address: '42 ถ.ศิริมังคลาจารย์ ต.สุเทพ อ.เมือง จ.เชียงใหม่',
        location: { lat: 18.7925, lng: 98.9721 },
        openTime: '07:00',
        closeTime: '17:30',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
        phone: '053-731-998',
        rating: 4.7,
        description: 'คัดสรรเมล็ดกาแฟสายพันธุ์พิเศษ Arabica และ Single Origin พร้อมบาริสต้ามืออาชีพ',
      },
    ];

    const shops = await Shop.insertMany(shopsData);

    // 3. เมนูกาแฟและเครื่องดื่ม
    const baseMenus = [
      {
        name: 'Iced Vanilla Latte',
        category: 'latte',
        categoryNameTh: 'ลาเต้',
        beanType: 'Arabica',
        basePrice: 65,
        image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500',
        description: 'เอสเพรสโซ่ช็อตเข้มข้นผสมนมสดนุ่มละมุน พร้อมกลิ่นหอมวานิลลาฝรั่งเศส',
        isSeasonal: false,
      },
      {
        name: 'Caramel Macchiato',
        category: 'specialty',
        categoryNameTh: 'เมนูพิเศษ',
        beanType: 'Arabica',
        basePrice: 75,
        image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500',
        description: 'นมสดผสมไซรัปวานิลลา ราดด้วยเอสเพรสโซ่เข้มข้นและซอสคาราเมลหอมหวาน',
        isSeasonal: false,
      },
      {
        name: 'Cold Brew Signature',
        category: 'cold_brew',
        categoryNameTh: 'กาแฟสกัดเย็น',
        beanType: 'Arabica',
        basePrice: 70,
        image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500',
        description: 'กาแฟสกัดเย็นนาน 18 ชั่วโมง รสชาตินุ่มนวล ดื่มง่าย ไม่เปรี้ยวฝาด',
        isSeasonal: false,
      },
      {
        name: 'Honey Cinnamon Latte',
        category: 'latte',
        categoryNameTh: 'ลาเต้',
        beanType: 'Arabica',
        basePrice: 70,
        image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=500',
        description: 'ลาเต้ผสมน้ำผึ้งป่าแท้โรยด้วยผงซินนามอนหอมกรุ่น สดชื่นผ่อนคลาย',
        isSeasonal: true,
      },
      {
        name: 'Classic Americano',
        category: 'americano',
        categoryNameTh: 'อเมริกาโน่',
        beanType: 'Arabica',
        basePrice: 55,
        image: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=500',
        description: 'เอสเพรสโซ่ช็อตสกัดสดผสมน้ำสะอาด กลิ่นหอมฟุ้ง รสสัมผัสคลีนสะอาด',
        isSeasonal: false,
      },
      {
        name: 'Orange Americano Sparkler',
        category: 'americano',
        categoryNameTh: 'อเมริกาโน่',
        beanType: 'Arabica',
        basePrice: 75,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500',
        description: 'อเมริกาโน่ผสมน้ำส้มคั้นสดแท้ 100% เปรี้ยวหวานสดชื่นตื่นตัว',
        isSeasonal: true,
      },
      {
        name: 'Velvet Cappuccino',
        category: 'cappuccino',
        categoryNameTh: 'คาปูชิโน่',
        beanType: 'Arabica',
        basePrice: 65,
        image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500',
        description: 'โฟมนมหนานุ่มละมุน สัมผัสครีมมี่เข้ากันอย่างลงตัวกับเอสเพรสโซ่เข้ม',
        isSeasonal: false,
      },
      {
        name: 'Dark Chocolate Mocha',
        category: 'mocha',
        categoryNameTh: 'มอคค่า',
        beanType: 'Arabica',
        basePrice: 70,
        image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=500',
        description: 'ช็อกโกแลตเข้มข้นเกรดพรีเมียมผสานกับกาแฟเอสเพรสโซ่และฟองนม',
        isSeasonal: false,
      },
      {
        name: 'Double Shot Espresso',
        category: 'espresso',
        categoryNameTh: 'เอสเพรสโซ่',
        beanType: 'Arabica',
        basePrice: 50,
        image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500',
        description: 'ช็อตกาแฟเข้มข้นแบบดั้งเดิม ครีม่าสีทองหนานุ่ม บอดี้แน่นสะใจ',
        isSeasonal: false,
      },
      {
        name: 'Kyoto Matcha Espresso Fusion',
        category: 'specialty',
        categoryNameTh: 'เมนูพิเศษ',
        beanType: 'Arabica',
        basePrice: 85,
        image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500',
        description: 'ชาเขียวมัทฉะแท้เกรดพิธีการจากญี่ปุ่น ผสานเอสเพรสโซ่แยกเลเยอร์สวยงาม',
        isSeasonal: true,
      },
    ];

    let allMenuItems = [];
    for (const shop of shops) {
      const shopMenus = baseMenus.map((menu) => ({
        ...menu,
        shopId: shop._id,
        isAvailable: true,
      }));
      const created = await MenuItem.insertMany(shopMenus);
      allMenuItems = allMenuItems.concat(created);
    }

    // 4. สร้างออเดอร์ย้อนหลัง
    const primaryShop = shops[0];
    const sampleItems = allMenuItems.filter((m) => m.shopId.toString() === primaryShop._id.toString());
    const pastOrders = [];
    const statuses = ['completed', 'completed', 'completed', 'in_progress', 'ready', 'pending'];
    const now = new Date();

    for (let i = 0; i < 15; i++) {
      const randomItem = sampleItems[i % sampleItems.length];
      const quantity = (i % 2) + 1;
      const price = randomItem.basePrice * quantity + 15;
      const orderDate = new Date(now.getTime() - (i % 6) * 24 * 60 * 60 * 1000 - i * 3600 * 1000);

      pastOrders.push({
        orderNumber: `CC-${2000 + i}`,
        userId: customerUser._id,
        shopId: primaryShop._id,
        items: [
          {
            menuItemId: randomItem._id,
            name: randomItem.name,
            image: randomItem.image,
            size: i % 3 === 0 ? 'Venti' : i % 2 === 0 ? 'Grande' : 'Tall',
            intensity: i % 3 === 0 ? 'dark' : 'medium',
            intensityLabel: i % 3 === 0 ? 'เข้ม (3 Shots)' : 'ปานกลาง (2 Shots)',
            sweetness: i % 2 === 0 ? '50%' : '25%',
            sweetnessLabel: i % 2 === 0 ? 'หวานปกติ (50%)' : 'หวานน้อย (25%)',
            toppings: [{ name: 'Caramel Syrup', price: 15 }],
            notes: i % 2 === 0 ? 'ขอน้ำแข็งน้อยครับ' : '',
            price: price,
            quantity: quantity,
          },
        ],
        totalPrice: price,
        pickupType: i % 2 === 0 ? 'immediate' : 'scheduled',
        pickupTime: i % 2 === 0 ? 'รับทันที' : '14:30 น.',
        pickupDate: orderDate,
        status: statuses[i % statuses.length],
        paymentMethod: i % 3 === 0 ? 'wallet' : i % 2 === 0 ? 'promptpay' : 'credit_card',
        paymentStatus: 'paid',
        transactionId: `TXN-SEED-${1000 + i}`,
        createdAt: orderDate,
      });
    }

    await Order.insertMany(pastOrders);

    await Notification.create({
      userId: customerUser._id,
      title: 'ยินดีต้อนรับสู่ Coffee Cup!',
      message: 'รับเครดิตทดลองใช้ ฿650 ในกระเป๋าเงินของคุณ สั่งกาแฟแก้วโปรดได้เลย',
      type: 'system',
    });

    console.log('[Seed] ปลูกข้อมูลเริ่มต้นสำเร็จเรียบร้อยแล้ว');
  } catch (error) {
    console.error('[Seed Error]', error);
  }
};

// หากรันไฟล์นี้โดยตรงผ่าน `npm run seed`
if (require.main === module) {
  const { connectDB } = require('../config/db');
  connectDB().then(async () => {
    await seedData(true);
    process.exit(0);
  });
}

module.exports = { seedData };
