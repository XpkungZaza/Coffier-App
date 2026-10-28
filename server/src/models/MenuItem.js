const mongoose = require('mongoose');

// โมเดลรายการเมนูเครื่องดื่ม (MenuItem Model)
// ออกแบบให้ขยายสู่เมนูอื่น เช่น ชา, นม, โกโก้ ได้โดยไม่ต้องแก้ไขโครงสร้างหลัก
const menuItemSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'กรุณาระบุชื่อเมนู'],
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'espresso',
        'latte',
        'mocha',
        'americano',
        'cappuccino',
        'cold_brew',
        'specialty',
        'tea',
        'milk_cocoa',
      ],
      default: 'latte',
    },
    categoryNameTh: {
      type: String,
      default: 'กาแฟสด',
    },
    beanType: {
      type: String,
      enum: ['Arabica', 'Robusta', 'Liberica', 'Special Blend', 'Non-Coffee'],
      default: 'Arabica',
    },
    basePrice: {
      type: Number,
      required: [true, 'กรุณาระบุราคาเริ่มต้น'],
      min: 0,
    },
    image: {
      type: String,
      default: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600',
    },
    description: {
      type: String,
      default: '',
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isSeasonal: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
