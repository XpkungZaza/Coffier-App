const mongoose = require('mongoose');

let mongodInstance = null;

/**
 * เชื่อมต่อฐานข้อมูล MongoDB
 * รองรับการเชื่อมต่อไปยัง MongoDB ท้องถิ่น หรือ MongoDB Atlas
 * หากไม่มี MongoDB ในเครื่อง จะสลับมาใช้ In-Memory MongoDB โดยอัตโนมัติ เพื่อให้รันได้ทันที
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/coffee_cup';
  const useMemoryFallback = process.env.USE_MEMORY_DB_IF_LOCAL_FAILS !== 'false';

  try {
    // พยายามเชื่อมต่อ MongoDB ตาม URI ที่กำหนดไว้
    console.log(`[Database] กำลังเชื่อมต่อไปยัง MongoDB: ${mongoURI}`);
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500, // Timeout รวดเร็วหากไม่มี MongoDB instance
    });
    console.log('[Database] เชื่อมต่อ MongoDB สำเร็จเรียบร้อย');
  } catch (err) {
    if (useMemoryFallback) {
      console.warn(`[Database] ไม่พบ MongoDB ท้องถิ่น (${err.message})`);
      console.log('[Database] กำลังเริ่มต้น In-Memory MongoDB Server จำลองเพื่อให้รันได้ทันที...');
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const memUri = mongodInstance.getUri();
        await mongoose.connect(memUri);
        console.log(`[Database] เชื่อมต่อ In-Memory MongoDB จำลองสำเร็จ: ${memUri}`);
      } catch (memErr) {
        console.error('[Database] ไม่สามารถเปิดใช้งาน In-Memory MongoDB ได้:', memErr.message);
        throw memErr;
      }
    } else {
      console.error('[Database] ข้อผิดพลาดในการเชื่อมต่อ MongoDB:', err.message);
      throw err;
    }
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
