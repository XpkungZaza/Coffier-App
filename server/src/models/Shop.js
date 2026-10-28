const mongoose = require('mongoose');

// โมเดลข้อมูลร้านกาแฟที่ร่วมโครงการ (Shop Model)
const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'กรุณาระบุชื่อร้าน'],
      trim: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    // พิกัด GPS (Latitude, Longitude) สำหรับคำนวณระยะทางและแสดงผลบนแผนที่
    location: {
      lat: {
        type: Number,
        required: true,
        default: 18.7904, // พิกัดเชียงใหม่เริ่มต้น
      },
      lng: {
        type: Number,
        required: true,
        default: 98.9847,
      },
    },
    openTime: {
      type: String,
      default: '07:00',
    },
    closeTime: {
      type: String,
      default: '18:00',
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
    },
    phone: {
      type: String,
      default: '053-123456',
    },
    rating: {
      type: Number,
      default: 4.8,
    },
    description: {
      type: String,
      default: 'กาแฟคั่วพิเศษ Specialty Coffee สดใหม่ทุกแก้ว',
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Shop', shopSchema);
