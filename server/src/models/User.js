const mongoose = require('mongoose');

// โมเดลข้อมูลผู้ใช้งาน (User Model)
// รองรับ 2 บทบาท: customer (ลูกค้า) และ shop_owner (เจ้าของร้าน)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'กรุณาระบุชื่อ'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'กรุณาระบุอีเมล'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'กรุณาระบุรหัสผ่าน'],
    },
    role: {
      type: String,
      enum: ['customer', 'shop_owner'],
      default: 'customer',
    },
    phone: {
      type: String,
      default: '',
    },
    // กระเป๋าเงิน/เครดิตสะสมในแอป สำหรับชำระเงิน
    credit: {
      type: Number,
      default: 500, // ให้เครดิตเริ่มต้นสำหรับทดลองใช้งาน
      min: 0,
    },
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
