const mongoose = require('mongoose');

// โมเดลการแจ้งเตือน (Notification Model)
const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    title: {
      type: String,
      default: 'แจ้งเตือนสถานะออเดอร์',
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['order_created', 'order_status', 'payment_success', 'system'],
      default: 'order_status',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
