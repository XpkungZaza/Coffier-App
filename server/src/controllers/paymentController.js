const paymentService = require('../services/paymentService');
const Order = require('../models/Order');

// @desc   ประมวลผลการชำระเงินจำลอง (Mock Payment)
// @route  POST /api/payments/mock
const processMockPayment = async (req, res) => {
  try {
    const { method, amount, orderId, orderNumber, cardDetails } = req.body;

    const result = await paymentService.processPayment({
      method: method || 'promptpay',
      amount: Number(amount),
      orderNumber: orderNumber || `CC-${Math.floor(1000 + Math.random() * 9000)}`,
      cardDetails,
      user: req.user,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    // หากมี orderId ให้บันทึก transactionId และสถานะ
    if (orderId && result.status === 'paid') {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'paid',
        transactionId: result.transactionId,
      });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc   ยืนยันการชำระเงิน (เช่น จำลองการสแกน QR Code แล้วกดเสร็จสิ้น)
// @route  POST /api/payments/confirm
const confirmMockPayment = async (req, res) => {
  try {
    const { orderId, transactionId } = req.body;

    const result = await paymentService.confirmPayment(transactionId);

    if (orderId) {
      const order = await Order.findByIdAndUpdate(
        orderId,
        { paymentStatus: 'paid', transactionId },
        { new: true }
      );
      return res.json({ ...result, order });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { processMockPayment, confirmMockPayment };
