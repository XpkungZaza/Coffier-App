require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { connectDB } = require('./config/db');
const { initSocket } = require('./services/socketService');
const { seedData } = require('./seeds/seedData');
const errorHandler = require('./middleware/errorHandler');

// นำเข้า Routes
const authRoutes = require('./routes/authRoutes');
const shopRoutes = require('./routes/shopRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();
const server = http.createServer(app);

// เริ่มต้น Socket.IO สำหรับ Realtime Events
const io = initSocket(server);

// Middleware พื้นฐาน
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ทดสอบความพร้อมของเซิร์ฟเวอร์
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Coffee Cup API Server is running smoothly ☕',
    timestamp: new Date().toISOString(),
  });
});

// เชื่อมต่อ API Routes ต่าง ๆ
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);

// เส้นทางสำหรับดึงการแจ้งเตือนของผู้ใช้
const Notification = require('./models/Notification');
const { protect } = require('./middleware/auth');
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
app.patch('/api/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'อ่านการแจ้งเตือนทั้งหมดแล้ว' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// เริ่มต้นฐานข้อมูลและเซิร์ฟเวอร์ พร้อม auto-seed ข้อมูลตัวอย่างหากยังไม่มี
connectDB()
  .then(async () => {
    await seedData(false); // ปลูกข้อมูลอัตโนมัติหากฐานข้อมูลว่าง
    server.listen(PORT, () => {
      console.log(`=========================================`);
      console.log(`☕ Coffee Cup Backend Server`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`✨ Socket.IO Realtime: Enabled`);
      console.log(`=========================================`);
    });
  })
  .catch((err) => {
    console.error('ไม่สามารถเปิดเซิร์ฟเวอร์ได้:', err);
  });
