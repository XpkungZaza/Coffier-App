import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2,
  Plus,
  Minus,
  Clock,
  Store,
  ChevronRight,
  ArrowLeft,
  Coffee,
  Calendar,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const {
    cartItems,
    selectedShop,
    pickupType,
    setPickupType,
    pickupTime,
    setPickupTime,
    removeFromCart,
    updateQuantity,
    totalItems,
    totalPrice,
  } = useCart();

  const navigate = useNavigate();

  // กำหนดเวลาตัวเลือกในอนาคต
  const futureTimes = [
    'อีก 15 นาที',
    'อีก 30 นาที',
    'อีก 45 นาที',
    'อีก 1 ชั่วโมง',
    'กำหนดเวลาเอง (เช่น 14:30 น.)',
  ];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <div className="w-24 h-24 rounded-full bg-coffee-100 flex items-center justify-center text-4xl mb-4 text-coffee-600">
          ☕
        </div>
        <h2 className="text-xl font-bold text-coffee-900">ตะกร้าของคุณยังว่างเปล่า</h2>
        <p className="text-xs text-coffee-600 max-w-xs mt-1.5 mb-6">
          เลือกร้านกาแฟและปรับแต่งรสชาติกาแฟตามสไตล์ของคุณได้เลย
        </p>
        <Link
          to="/shops"
          className="px-6 py-3 rounded-2xl bg-coffee-700 hover:bg-coffee-800 text-white font-semibold text-sm shadow-soft transition-all hover:scale-[1.02]"
        >
          เลือกร้านกาแฟ
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-32 pt-4 px-4 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-2xl bg-white border border-coffee-200 text-coffee-800 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-extrabold text-coffee-900">
          ตะกร้าสินค้า ({totalItems} แก้ว)
        </h1>
        <div className="w-9"></div>
      </div>

      {/* Selected Shop Info Card */}
      {selectedShop && (
        <div className="coffee-card rounded-2xl p-3.5 border border-coffee-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-coffee-100 flex items-center justify-center text-coffee-800">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-coffee-500 block">ร้านที่สั่ง</span>
              <h3 className="font-bold text-xs sm:text-sm text-coffee-900">
                {selectedShop.name}
              </h3>
            </div>
          </div>
          <Link
            to={`/shops/${selectedShop._id}`}
            className="text-xs text-coffee-600 hover:text-coffee-900 font-medium"
          >
            เพิ่มเมนูอื่น
          </Link>
        </div>
      )}

      {/* Pickup Time Selector (ตาม Concept Paper: รับทันที หรือ เลือกเวลาในอนาคต) */}
      <div className="coffee-card rounded-3xl p-4 border border-coffee-200/90 space-y-3">
        <label className="text-xs font-bold text-coffee-800 uppercase tracking-wider flex items-center space-x-1.5">
          <Clock className="w-4 h-4 text-coffee-600" />
          <span>กำหนดเวลารับเครื่องดื่ม</span>
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setPickupType('immediate');
              setPickupTime('รับทันที (10-15 นาที)');
            }}
            className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all ${
              pickupType === 'immediate'
                ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm'
                : 'bg-white text-coffee-700 border-coffee-200 hover:border-coffee-300'
            }`}
          >
            ⚡ รับทันที (10-15 นาที)
          </button>

          <button
            onClick={() => {
              setPickupType('scheduled');
              setPickupTime('อีก 30 นาที');
            }}
            className={`py-2.5 px-3 rounded-2xl text-xs font-semibold border transition-all ${
              pickupType === 'scheduled'
                ? 'bg-coffee-700 text-white border-coffee-700 shadow-sm'
                : 'bg-white text-coffee-700 border-coffee-200 hover:border-coffee-300'
            }`}
          >
            🕒 เลือกเวลาล่วงหน้า
          </button>
        </div>

        {pickupType === 'scheduled' && (
          <div className="pt-1 space-y-1.5">
            <span className="text-[11px] text-coffee-600">เลือกช่วงเวลาที่คุณจะไปรับ:</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {futureTimes.map((timeOption) => (
                <button
                  key={timeOption}
                  onClick={() => setPickupTime(timeOption)}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-medium border text-center transition-all ${
                    pickupTime === timeOption
                      ? 'bg-amber-100 text-amber-900 border-amber-400 font-semibold shadow-sm'
                      : 'bg-white text-coffee-700 border-coffee-200 hover:border-coffee-300'
                  }`}
                >
                  {timeOption}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cart Items List with Customization Details */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-coffee-800 uppercase tracking-wider">
          รายการเครื่องดื่มที่ปรับแต่ง
        </h2>

        {cartItems.map((item, index) => (
          <div
            key={index}
            className="coffee-card rounded-3xl p-4 border border-coffee-200 space-y-3 shadow-sm"
          >
            <div className="flex space-x-3.5">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-2xl object-cover border border-coffee-100 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-sm text-coffee-900 truncate">
                    {item.name}
                  </h4>
                  <button
                    onClick={() => removeFromCart(index)}
                    className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                    title="ลบรายการนี้"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Customization Badges */}
                <div className="flex flex-wrap gap-1.5 mt-1 text-[10px]">
                  <span className="px-2 py-0.5 rounded-md bg-coffee-100 text-coffee-800 font-medium">
                    ขนาด: {item.size}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 font-medium">
                    ความเข้ม: {item.intensityLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 font-medium">
                    ความหวาน: {item.sweetnessLabel}
                  </span>
                </div>

                {/* Toppings list */}
                {item.toppings?.length > 0 && (
                  <p className="text-[11px] text-coffee-600 mt-1">
                    ท็อปปิ้ง: {item.toppings.map((t) => `${t.name} (+฿${t.price})`).join(', ')}
                  </p>
                )}

                {item.notes && (
                  <p className="text-[11px] text-coffee-500 italic mt-0.5">
                    โน้ต: "{item.notes}"
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-coffee-100 flex items-center justify-between">
              <div className="flex items-center space-x-2 bg-coffee-50 p-1 rounded-xl border border-coffee-200">
                <button
                  onClick={() => updateQuantity(index, -1)}
                  className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-coffee-800 shadow-sm"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="w-6 text-center text-xs font-bold text-coffee-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => updateQuantity(index, 1)}
                  className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-coffee-800 shadow-sm"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-coffee-900">
                  ฿{item.price * item.quantity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
      <div className="coffee-card rounded-3xl p-4 border border-coffee-200/90 space-y-2 text-xs">
        <div className="flex justify-between text-coffee-600">
          <span>ยอดรวมค่าเครื่องดื่ม</span>
          <span>฿{totalPrice}</span>
        </div>
        <div className="flex justify-between text-coffee-600">
          <span>ค่าบริการสั่งล่วงหน้า</span>
          <span className="text-emerald-700 font-semibold">ฟรี (โปรโมชั่น)</span>
        </div>
        <div className="pt-2 border-t border-coffee-200 flex justify-between font-bold text-sm text-coffee-900">
          <span>ยอดชำระสุทธิ</span>
          <span className="text-base font-extrabold text-amber-800">฿{totalPrice}</span>
        </div>
      </div>

      {/* Checkout Floating Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-coffee-200/80 p-4 shadow-float">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-coffee-500 block">ยอดรวมทั้งสิ้น</span>
            <span className="text-lg font-extrabold text-coffee-900 leading-none">
              ฿{totalPrice}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-coffee-700 hover:bg-coffee-800 text-white font-bold text-sm shadow-soft transition-all hover:scale-[1.01] flex items-center justify-center space-x-2"
          >
            <span>ดำเนินการชำระเงิน</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
