// Payment Service Layer (ระบบจำลอง Payment Gateway)
// แยกเป็น Service Layer อิสระเพื่อให้สามารถสลับไปเชื่อมต่อกับ Payment Gateway จริง (เช่น Omise, Stripe, 2C2P) ได้โดยสะดวก

class PaymentService {
  /**
   * สร้างคำขอชำระเงินตามช่องทางที่เลือก
   * @param {Object} paymentData
   * @param {string} paymentData.method - 'promptpay' | 'credit_card' | 'wallet'
   * @param {number} paymentData.amount - ยอดเงินรวม
   * @param {string} paymentData.orderNumber - รหัสออเดอร์
   * @param {Object} [paymentData.cardDetails] - ข้อมูลบัตรเครดิต
   * @param {Object} [paymentData.user] - ข้อมูลผู้ใช้
   */
  async processPayment({ method, amount, orderNumber, cardDetails, user }) {
    const timestamp = Date.now();
    const transactionId = `TXN-${method.toUpperCase()}-${timestamp}-${Math.floor(Math.random() * 9000 + 1000)}`;

    switch (method) {
      case 'promptpay': {
        // สร้างข้อมูล PromptPay QR Code จำลอง
        // รูปแบบข้อความ EMVCo PromptPay หรือ URL จำลองสำหรับแสดงผล QR Code
        const promptPayId = '0812345678';
        const qrData = `00020101021129370016A00000067701011101130066${promptPayId.slice(1)}5802TH5303764540${amount.toFixed(2)}6304`;

        return {
          success: true,
          status: 'pending',
          transactionId,
          method: 'promptpay',
          amount,
          orderNumber,
          qrCodeData: qrData,
          promptPayNumber: promptPayId,
          expiresInMinutes: 15,
          message: 'สร้าง QR Code PromptPay จำลองเรียบร้อย กรุณาสแกนเพื่อชำระเงิน',
        };
      }

      case 'credit_card': {
        // จำลองการตรวจสอบบัตรเครดิต/เดบิต
        const last4 = cardDetails?.cardNumber ? cardDetails.cardNumber.slice(-4) : '4242';
        return {
          success: true,
          status: 'paid',
          transactionId,
          method: 'credit_card',
          amount,
          orderNumber,
          cardInfo: {
            brand: 'VISA',
            last4: last4,
          },
          paidAt: new Date(),
          message: 'ชำระเงินผ่านบัตรเครดิต/เดบิตจำลองสำเร็จ',
        };
      }

      case 'wallet': {
        // ตรวจสอบและตัดยอดเงินในกระเป๋าเงิน (Wallet / Credit)
        if (!user || user.credit < amount) {
          return {
            success: false,
            status: 'failed',
            message: `ยอดเงินในกระเป๋าไม่เพียงพอ (ยอดคงเหลือ: ฿${user ? user.credit : 0}, ยอดที่ต้องชำระ: ฿${amount})`,
          };
        }

        return {
          success: true,
          status: 'paid',
          transactionId,
          method: 'wallet',
          amount,
          orderNumber,
          remainingCredit: user.credit - amount,
          paidAt: new Date(),
          message: 'ตัดเงินจากกระเป๋าเงิน Coffee Cup สำเร็จ',
        };
      }

      default:
        throw new Error(`ไม่รองรับช่องทางการชำระเงิน: ${method}`);
    }
  }

  /**
   * ยืนยันผลการชำระเงิน (เช่น เมื่อลูกค้ากดปุ่ม "ฉันสแกนจ่ายเรียบร้อยแล้ว")
   */
  async confirmPayment(transactionId) {
    return {
      success: true,
      transactionId,
      status: 'paid',
      confirmedAt: new Date(),
      message: 'ยืนยันการชำระเงินสำเร็จ เครื่องดื่มเข้าสู่คิวการทำ',
    };
  }
}

module.exports = new PaymentService();
