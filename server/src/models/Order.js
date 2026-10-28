const mongoose = require('mongoose');

// โมเดลออเดอร์คำสั่งซื้อ (Order Model)
const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: String,
  size: {
    type: String,
    enum: ['Tall', 'Grande', 'Venti'],
    default: 'Grande',
  },
  // ความเข้ม 3 ระดับ: อ่อน (1 ช็อต), ปานกลาง (2 ช็อต), เข้ม (3 ช็อต)
  intensity: {
    type: String,
    enum: ['light', 'medium', 'dark'],
    default: 'medium',
  },
  intensityLabel: {
    type: String,
    default: 'ปานกลาง (2 Shots)',
  },
  // ความหวาน 4 ระดับ: 0% (ไม่หวาน), 25% (หวานน้อย), 50% (ปานกลาง), 100% (หวานมาก)
  sweetness: {
    type: String,
    enum: ['0%', '25%', '50%', '100%'],
    default: '50%',
  },
  sweetnessLabel: {
    type: String,
    default: 'หวานปกติ (50%)',
  },
  toppings: [
    {
      name: String,
      price: Number,
    },
  ],
  notes: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    items: [orderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    pickupType: {
      type: String,
      enum: ['immediate', 'scheduled'],
      default: 'immediate',
    },
    pickupTime: {
      type: String,
      required: [true, 'กรุณาระบุเวลารับเครื่องดื่ม'],
    },
    pickupDate: {
      type: Date,
      default: Date.now,
    },
    // สถานะออเดอร์: รอรับออเดอร์ -> กำลังทำ -> พร้อมรับ -> รับแล้ว / ยกเลิก
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'ready', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['promptpay', 'credit_card', 'wallet'],
      default: 'promptpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    transactionId: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
