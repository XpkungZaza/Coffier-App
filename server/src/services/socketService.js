// Realtime Service ด้วย Socket.IO
// จัดการการแจ้งเตือนและการอัปเดตสถานะออเดอร์แบบเรียลไทม์ระหว่างลูกค้าและร้านค้า

let io = null;

const initSocket = (server) => {
  const { Server } = require('socket.io');
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`[Socket] ผู้ใช้เชื่อมต่อเข้ามา Socket ID: ${socket.id}`);

    // ลูกค้าเข้าร่วมห้องส่วนตัวตาม userId เพื่อรับแจ้งเตือนออเดอร์ของตนเอง
    socket.on('join_user', (userId) => {
      if (userId) {
        socket.join(`user_${userId}`);
        console.log(`[Socket] User ${userId} เข้าร่วมห้อง user_${userId}`);
      }
    });

    // ร้านค้าเข้าร่วมห้องตาม shopId เพื่อรับออเดอร์ใหม่แบบเรียลไทม์
    socket.on('join_shop', (shopId) => {
      if (shopId) {
        socket.join(`shop_${shopId}`);
        console.log(`[Socket] Shop ${shopId} เข้าร่วมห้อง shop_${shopId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] ผู้ใช้ตัดการเชื่อมต่อ Socket ID: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO ยังไม่ได้เริ่มต้น');
  }
  return io;
};

// ส่งการแจ้งเตือนไปยังลูกค้าเมื่อสถานะออเดอร์เปลี่ยน
const emitOrderStatusUpdate = (userId, order) => {
  if (!io) return;
  io.to(`user_${userId}`).emit('order_status_updated', order);
  io.to(`shop_${order.shopId}`).emit('order_status_updated', order);

  if (order.status === 'ready') {
    io.to(`user_${userId}`).emit('order_ready', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      message: `กาแฟออเดอร์ #${order.orderNumber} ทำเสร็จพร้อมรับแล้ว! เชิญรับที่เคาน์เตอร์ได้เลยค่ะ`,
    });
  }
};

// ส่งการแจ้งเตือนไปยังร้านค้าเมื่อมีออเดอร์ใหม่เข้ามา
const emitNewOrderToShop = (shopId, order) => {
  if (!io) return;
  io.to(`shop_${shopId}`).emit('new_order', {
    order,
    message: `มีออเดอร์ใหม่ #${order.orderNumber} เข้ามาแล้ว!`,
  });
};

module.exports = {
  initSocket,
  getIO,
  emitOrderStatusUpdate,
  emitNewOrderToShop,
};
