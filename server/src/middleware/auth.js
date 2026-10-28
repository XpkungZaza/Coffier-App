const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware ตรวจสอบความถูกต้องของ JWT Token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'coffeecup_super_secret_jwt_key_2026_cmtc'
      );

      req.user = await User.findById(decoded.id).select('-passwordHash');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'ไม่พบข้อมูลผู้ใช้นี้ในระบบ' });
      }

      next();
    } catch (error) {
      console.error('[Auth Error]', error.message);
      return res.status(401).json({ success: false, message: 'Token ไม่ถูกต้องหรือหมดอายุ' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึง (ไม่พบ Token)' });
  }
};

// Middleware จำกัดสิทธิ์ตามบทบาท (Roles)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `บทบาท ${req.user ? req.user.role : 'Guest'} ไม่มีสิทธิ์เข้าถึงส่วนนี้`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
