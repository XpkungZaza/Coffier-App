const Order = require('../models/Order');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { emitOrderStatusUpdate, emitNewOrderToShop } = require('../services/socketService');

// @desc   สร้างออเดอร์ใหม่
// @route  POST /api/orders
const createOrder = async (req, res) => {
  try {
    const {
      shopId,
      items,
      totalPrice,
      pickupType,
      pickupTime,
      pickupDate,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'ไม่มีรายการเครื่องดื่มในออเดอร์' });
    }

    if (!shopId) {
      return res.status(400).json({ success: false, message: 'กรุณาระบุร้านกาแฟ' });
    }

    // สร้างหมายเลขออเดอร์ที่ไม่ซ้ำ (เช่น CC-4821)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `CC-${randomCode}`;

    // ตรวจสอบการตัดเงินจากกระเป๋าเงิน (Wallet) หากเลือกวิธีนี้
    let paymentStatus = 'pending';
    let transactionId = `TXN-${paymentMethod?.toUpperCase()}-${Date.now()}`;

    if (paymentMethod === 'wallet') {
      const user = await User.findById(req.user._id);
      if (user.credit < totalPrice) {
        return res.status(400).json({
          success: false,
          message: `ยอดเงินในกระเป๋าไม่พอ (คงเหลือ ฿${user.credit}, ยอดที่ต้องชำระ ฿${totalPrice})`,
        });
      }
      user.credit -= totalPrice;
      await user.save();
      paymentStatus = 'paid';
    } else if (paymentMethod === 'credit_card') {
      paymentStatus = 'paid'; // Mock payment card สำเร็จทันที
    }

    const order = await Order.create({
      orderNumber,
      userId: req.user._id,
      shopId,
      items,
      totalPrice,
      pickupType: pickupType || 'immediate',
      pickupTime: pickupTime || 'รับทันที (10-15 นาที)',
      pickupDate: pickupDate || new Date(),
      status: 'pending',
      paymentMethod: paymentMethod || 'promptpay',
      paymentStatus,
      transactionId,
    });

    // สร้างการแจ้งเตือนในระบบ
    await Notification.create({
      userId: req.user._id,
      orderId: order._id,
      title: 'สร้างออเดอร์สำเร็จ',
      message: `ออเดอร์ #${orderNumber} ถูกส่งไปยังร้านค้าแล้ว เวลารับ: ${order.pickupTime}`,
      type: 'order_created',
    });

    // ดึงข้อมูลร้านค้าเพื่อส่งกลับ
    const populatedOrder = await Order.findById(order._id)
      .populate('shopId', 'name address phone location image')
      .populate('userId', 'name email phone');

    // แจ้งเตือนร้านค้าผ่าน Realtime Socket.IO ทันที
    emitNewOrderToShop(shopId, populatedOrder);

    res.status(201).json({
      success: true,
      message: 'สั่งซื้อสำเร็จ! รอร้านค้ารับออเดอร์',
      order: populatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   ดึงประวัติออเดอร์ของลูกค้าปัจจุบัน
// @route  GET /api/orders/my
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate('shopId', 'name address phone image')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   ดึงรายการออเดอร์ของร้านค้า (สำหรับ Shop Owner Dashboard)
// @route  GET /api/orders/shop
const getShopOrders = async (req, res) => {
  try {
    const { shopId, status } = req.query;
    let targetShopId = shopId;

    if (!targetShopId) {
      const shop = await Shop.findOne({ ownerId: req.user._id });
      if (!shop) {
        return res.status(404).json({ success: false, message: 'ไม่พบข้อมูลร้านของคุณ' });
      }
      targetShopId = shop._id;
    }

    let filter = { shopId: targetShopId };

    if (status && status !== 'all') {
      if (status === 'active') {
        // ออเดอร์ที่กำลังดำเนินการ (รอรับ, กำลังทำ, พร้อมรับ)
        filter.status = { $in: ['pending', 'in_progress', 'ready'] };
      } else {
        filter.status = status;
      }
    }

    // เรียงตามสถานะและเวลารับ (pickupDate/createdAt) เพื่อจัดคิวเครื่องดื่ม
    const orders = await Order.find(filter)
      .populate('userId', 'name phone email')
      .populate('shopId', 'name address')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   ดึงรายละเอียดออเดอร์ตาม ID
// @route  GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('shopId', 'name address phone location image')
      .populate('userId', 'name phone email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'ไม่พบออเดอร์นี้' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   เปลี่ยนสถานะออเดอร์ (สำหรับร้านค้า)
// @route  PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'in_progress', 'ready', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'สถานะไม่ถูกต้อง' });
    }

    const order = await Order.findById(req.params.id)
      .populate('shopId', 'name address phone')
      .populate('userId', 'name phone email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'ไม่พบออเดอร์นี้' });
    }

    order.status = status;
    await order.save();

    // สร้างข้อความแจ้งเตือนตามสถานะ
    let message = '';
    if (status === 'in_progress') {
      message = `บาริสต้ากำลังชงเครื่องดื่มของคุณ (ออเดอร์ #${order.orderNumber})`;
    } else if (status === 'ready') {
      message = `🎉 กาแฟของคุณพร้อมรับแล้ว! เชิญรับได้ที่ร้าน ${order.shopId.name} เคาน์เตอร์ได้เลยค่ะ`;
    } else if (status === 'completed') {
      message = `รับเครื่องดื่ม #${order.orderNumber} เรียบร้อยแล้ว ขอบคุณที่ใช้บริการ`;
    } else if (status === 'cancelled') {
      message = `ออเดอร์ #${order.orderNumber} ถูกยกเลิก`;
    }

    if (message) {
      await Notification.create({
        userId: order.userId._id,
        orderId: order._id,
        title: `อัปเดตสถานะออเดอร์ #${order.orderNumber}`,
        message,
        type: 'order_status',
      });
    }

    // ส่งแจ้งเตือน Realtime ผ่าน Socket.IO ถึงลูกค้าและอัปเดตบอร์ดร้านค้า
    emitOrderStatusUpdate(order.userId._id.toString(), order);

    res.json({
      success: true,
      message: `อัปเดตสถานะเป็น ${status} สำเร็จ`,
      order,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getShopOrders,
  getOrderById,
  updateOrderStatus,
};
