import React, { useState, useEffect } from 'react';
import { QrCode, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

export default function PromptPayQR({ amount, orderNumber, onPaymentSuccess }) {
  const [timeLeft, setTimeLeft] = useState(900); // 15 นาที
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess();
    }, 1200);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-coffee-200 shadow-soft max-w-sm mx-auto text-center">
      {/* PromptPay Header */}
      <div className="bg-[#003D6B] text-white py-3 px-4 rounded-2xl flex items-center justify-between mb-4 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="bg-white text-[#003D6B] font-black text-xs px-2 py-0.5 rounded tracking-tighter">
            พร้อมเพย์
          </div>
          <span className="text-xs font-semibold">PromptPay</span>
        </div>
        <span className="text-[11px] opacity-80">สแกนจ่ายได้ทุกธนาคาร</span>
      </div>

      {/* QR Code Container */}
      <div className="relative p-4 bg-slate-50 border-2 border-dashed border-coffee-300 rounded-2xl inline-block my-2 shadow-inner">
        {/* Dynamic Mock SVG QR Code */}
        <svg
          viewBox="0 0 100 100"
          className="w-48 h-48 mx-auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* QR Code Background & Corner Markers */}
          <rect width="100" height="100" fill="#FFFFFF" rx="4" />
          {/* Top-Left Position Square */}
          <rect x="10" y="10" width="24" height="24" fill="#003D6B" rx="3" />
          <rect x="14" y="14" width="16" height="16" fill="#FFFFFF" rx="2" />
          <rect x="18" y="18" width="8" height="8" fill="#003D6B" rx="1" />

          {/* Top-Right Position Square */}
          <rect x="66" y="10" width="24" height="24" fill="#003D6B" rx="3" />
          <rect x="70" y="14" width="16" height="16" fill="#FFFFFF" rx="2" />
          <rect x="74" y="18" width="8" height="8" fill="#003D6B" rx="1" />

          {/* Bottom-Left Position Square */}
          <rect x="10" y="66" width="24" height="24" fill="#003D6B" rx="3" />
          <rect x="14" y="70" width="16" height="16" fill="#FFFFFF" rx="2" />
          <rect x="18" y="74" width="8" height="8" fill="#003D6B" rx="1" />

          {/* Stylized Data Pixels */}
          <rect x="42" y="12" width="6" height="6" fill="#003D6B" />
          <rect x="52" y="16" width="6" height="6" fill="#003D6B" />
          <rect x="44" y="26" width="14" height="6" fill="#003D6B" />
          <rect x="14" y="44" width="6" height="12" fill="#003D6B" />
          <rect x="26" y="42" width="12" height="6" fill="#003D6B" />
          <rect x="46" y="44" width="10" height="10" fill="#C19A6B" />
          <rect x="64" y="42" width="8" height="6" fill="#003D6B" />
          <rect x="78" y="48" width="10" height="6" fill="#003D6B" />
          <rect x="42" y="62" width="6" height="12" fill="#003D6B" />
          <rect x="54" y="68" width="8" height="8" fill="#003D6B" />
          <rect x="68" y="74" width="20" height="6" fill="#003D6B" />
          <rect x="76" y="64" width="6" height="6" fill="#003D6B" />

          {/* Center Logo Icon */}
          <circle cx="50" cy="50" r="10" fill="#003D6B" />
          <path
            d="M47 48h6v5a3 3 0 0 1-6 0v-5z"
            fill="#F5EBD7"
          />
        </svg>

        <div className="mt-2 text-xs text-coffee-600 font-medium">
          ชื่อบัญชี: บจก. คอฟฟี่ คัพ (เชียงใหม่)
        </div>
      </div>

      {/* Amount and Timer */}
      <div className="my-3">
        <span className="text-xs text-coffee-500">ยอดชำระทั้งหมด</span>
        <div className="text-3xl font-extrabold text-coffee-900 tracking-tight">
          ฿{amount?.toLocaleString()}
        </div>
        <div className="flex items-center justify-center space-x-1.5 text-xs text-amber-700 mt-2 bg-amber-50 py-1 px-3 rounded-full inline-flex">
          <Clock className="w-3.5 h-3.5" />
          <span>
            รหัส QR หมดอายุใน: {minutes}:{seconds < 10 ? `0${seconds}` : seconds} นาที
          </span>
        </div>
      </div>

      {/* Simulation Button */}
      <button
        onClick={handleSimulatePayment}
        disabled={isProcessing}
        className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
      >
        {isProcessing ? (
          <span>กำลังตรวจสอบยอดเงิน...</span>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>ฉันสแกนจ่ายเรียบร้อยแล้ว (จำลอง)</span>
          </>
        )}
      </button>

      <div className="flex items-center justify-center space-x-1 text-[11px] text-coffee-500 mt-3">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>ระบบจำลอง Payment Gateway แบบแยก Service Layer</span>
      </div>
    </div>
  );
}
