import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard,
  QrCode,
  Wallet,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Store,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PromptPayQR from '../components/PromptPayQR';

export default function Checkout() {
  const { cartItems, selectedShop, pickupType, pickupTime, totalPrice, clearCart } = useCart();
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState('promptpay'); // 'promptpay' | 'credit_card' | 'wallet'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '4242 •••• •••• 4242',
    cardName: user?.name || 'Kittisak Chaimongkol',
    exp: '12/28',
    cvv: '888',
  });

  const handlePlaceOrder = async (isQrConfirmed = false) => {
    if (!user) {
      navigate('/login?redirect=/checkout');
      return;
    }

    if (cartItems.length === 0 || !selectedShop) {
      navigate('/cart');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // สร้างออเดอร์ส่งไปยัง Backend
      const orderData = {
        shopId: selectedShop._id,
        items: cartItems,
        totalPrice,
        pickupType,
        pickupTime,
        paymentMethod,
      };

      const res = await api.post('/orders', orderData);

      if (res.success && res.order) {
        await refreshUser(); // อัปเดตเครดิตกระเป๋าเงิน
        clearCart(); // ล้างตะกร้า
        navigate(`/orders/${res.order._id}`);
      }
    } catch (err) {
      setError(err.message || 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-32 pt-4 px-4 max-w-2xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/cart')}
          className="p-2 rounded-2xl bg-white border border-coffee-200 text-coffee-800 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-coffee-900">
          ชำระเงิน (Checkout)
        </h1>
        <div className="w-9"></div>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Order Destination & Pickup Time Preview */}
      <div className="coffee-card rounded-3xl p-4 border border-coffee-200 space-y-2.5">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-coffee-100">
          <div className="flex items-center space-x-2 text-coffee-800 font-semibold">
            <Store className="w-4 h-4 text-coffee-600" />
            <span>{selectedShop?.name}</span>
          </div>
          <div className="flex items-center space-x-1.5 text-accent-mint font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>{pickupTime}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-coffee-600">
          <span>จำนวนรายการ:</span>
          <span className="font-semibold text-coffee-900">{cartItems.length} แก้ว</span>
        </div>
        <div className="flex items-center justify-between text-xs text-coffee-600">
          <span>ยอดรวมทั้งหมด:</span>
          <span className="text-base font-extrabold text-coffee-900">฿{totalPrice}</span>
        </div>
      </div>

      {/* Payment Method Selector (ตาม Concept Paper หน้าที่ 6) */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-coffee-800 uppercase tracking-wider block">
          เลือกช่องทางการชำระเงิน
        </label>

        <div className="grid grid-cols-3 gap-2.5">
          {/* PromptPay */}
          <button
            onClick={() => setPaymentMethod('promptpay')}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
              paymentMethod === 'promptpay'
                ? 'bg-coffee-800 text-white border-coffee-800 shadow-soft ring-2 ring-coffee-400/40'
                : 'bg-white text-coffee-800 border-coffee-200 hover:border-coffee-400'
            }`}
          >
            <QrCode className="w-5 h-5 mb-1" />
            <span className="font-bold text-xs">PromptPay</span>
            <span className="text-[10px] opacity-75">พร้อมเพย์ QR</span>
          </button>

          {/* Credit/Debit Card */}
          <button
            onClick={() => setPaymentMethod('credit_card')}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
              paymentMethod === 'credit_card'
                ? 'bg-coffee-800 text-white border-coffee-800 shadow-soft ring-2 ring-coffee-400/40'
                : 'bg-white text-coffee-800 border-coffee-200 hover:border-coffee-400'
            }`}
          >
            <CreditCard className="w-5 h-5 mb-1" />
            <span className="font-bold text-xs">บัตรเครดิต</span>
            <span className="text-[10px] opacity-75">VISA / Master</span>
          </button>

          {/* Wallet / Credit */}
          <button
            onClick={() => setPaymentMethod('wallet')}
            className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${
              paymentMethod === 'wallet'
                ? 'bg-coffee-800 text-white border-coffee-800 shadow-soft ring-2 ring-coffee-400/40'
                : 'bg-white text-coffee-800 border-coffee-200 hover:border-coffee-400'
            }`}
          >
            <Wallet className="w-5 h-5 mb-1" />
            <span className="font-bold text-xs">กระเป๋าเงิน</span>
            <span className="text-[10px] opacity-75">฿{user?.credit || 0}</span>
          </button>
        </div>
      </div>

      {/* Detailed Payment Input Form according to Selection */}
      <div className="pt-2">
        {paymentMethod === 'promptpay' && (
          <PromptPayQR
            amount={totalPrice}
            orderNumber="NEW"
            onPaymentSuccess={() => handlePlaceOrder(true)}
          />
        )}

        {paymentMethod === 'credit_card' && (
          <div className="coffee-card rounded-3xl p-5 border border-coffee-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
              <span className="text-xs font-bold text-coffee-800">
                ข้อมูลบัตรเครดิต/เดบิต (จำลอง)
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                Mock Gateway
              </span>
            </div>

            <div>
              <label className="text-[11px] text-coffee-500 block mb-1">หมายเลขบัตร</label>
              <input
                type="text"
                value={cardDetails.cardNumber}
                onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-coffee-200 text-xs text-coffee-900 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-coffee-500 block mb-1">วันหมดอายุ</label>
                <input
                  type="text"
                  value={cardDetails.exp}
                  onChange={(e) => setCardDetails({ ...cardDetails, exp: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coffee-200 text-xs text-coffee-900 bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] text-coffee-500 block mb-1">CVV</label>
                <input
                  type="text"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-coffee-200 text-xs text-coffee-900 bg-white"
                />
              </div>
            </div>

            <button
              onClick={() => handlePlaceOrder(false)}
              disabled={loading}
              className="w-full mt-4 py-3 rounded-2xl bg-coffee-800 hover:bg-coffee-900 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'กำลังประมวลผลการชำระเงิน...' : `ชำระเงินทันที ฿${totalPrice}`}
            </button>
          </div>
        )}

        {paymentMethod === 'wallet' && (
          <div className="coffee-card rounded-3xl p-5 border border-coffee-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-coffee-900">
                  กระเป๋าเงิน Coffee Cup (Wallet Credit)
                </h4>
                <p className="text-xs text-coffee-600 mt-0.5">
                  หักชำระจากยอดเครดิตสะสมในบัญชีของคุณ
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-coffee-500 block">ยอดคงเหลือ</span>
                <span className="text-lg font-extrabold text-coffee-900">
                  ฿{user?.credit?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {user && user.credit < totalPrice ? (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                ยอดเครดิตของคุณไม่เพียงพอ กรุณากดปุ่มเติมเงินด้านบน หรือเลือกชำระผ่าน PromptPay QR
              </div>
            ) : (
              <button
                onClick={() => handlePlaceOrder(false)}
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันหักเงินในกระเป๋า ฿{totalPrice}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="text-center pt-2">
        <span className="text-[11px] text-coffee-400 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>ระบบรักษาความปลอดภัยจำลองมาตรฐาน PCI-DSS Ready</span>
        </span>
      </div>
    </div>
  );
}
