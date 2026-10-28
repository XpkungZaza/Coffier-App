import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  Coffee,
  CheckCircle2,
  PackageCheck,
  Store,
  MapPin,
  Phone,
  ChevronRight,
  ExternalLink,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import StatusBadge from '../components/StatusBadge';

const STEPS = [
  { key: 'pending', title: 'รอรับออเดอร์', desc: 'ร้านกำลังตรวจสอบรายการ' },
  { key: 'in_progress', title: 'กำลังชงกาแฟ', desc: 'บาริสต้ากำลังรังสรรค์รสชาติตามที่คุณปรับแต่ง' },
  { key: 'ready', title: 'พร้อมรับแล้ว', desc: 'เครื่องดื่มเสร็จแล้ว เชิญรับที่เคาน์เตอร์' },
  { key: 'completed', title: 'รับเรียบร้อย', desc: 'ขอบคุณที่ใช้บริการ Coffee Cup' },
];

export default function OrderTracking() {
  const { id } = useParams();
  const { socket } = useSocket();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.order);
    } catch (err) {
      console.warn('Fetch order failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Listen to Socket.IO live updates for this order
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = (updatedOrder) => {
      if (updatedOrder._id === id || updatedOrder.orderNumber === order?.orderNumber) {
        setOrder(updatedOrder);
      }
    };

    socket.on('order_status_updated', handleUpdate);
    return () => {
      socket.off('order_status_updated', handleUpdate);
    };
  }, [socket, id, order]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="h-40 rounded-3xl bg-coffee-100 animate-pulse"></div>
        <div className="h-64 rounded-3xl bg-coffee-100 animate-pulse"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 px-4">
        <p className="text-coffee-600 text-sm">ไม่พบข้อมูลออเดอร์นี้</p>
        <Link to="/orders" className="text-xs text-coffee-800 font-bold underline mt-2 inline-block">
          กลับไปดูประวัติการสั่งซื้อ
        </Link>
      </div>
    );
  }

  // Calculate current step index
  const statusOrder = ['pending', 'in_progress', 'ready', 'completed'];
  const currentStepIndex = statusOrder.indexOf(order.status);
  const isReady = order.status === 'ready';

  return (
    <div className="pb-28 pt-4 px-4 max-w-2xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/orders"
          className="p-2 rounded-2xl bg-white border border-coffee-200 text-coffee-800 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[11px] font-semibold text-coffee-500 uppercase tracking-wider block">
            Live Order Tracking
          </span>
          <h1 className="text-lg font-extrabold text-coffee-900">
            ออเดอร์ #{order.orderNumber}
          </h1>
        </div>
        <div className="w-9"></div>
      </div>

      {/* Main Status Hero Banner */}
      <div
        className={`rounded-3xl p-6 text-center border shadow-float transition-all ${
          isReady
            ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white border-emerald-400 ring-4 ring-emerald-300/40 animate-glow-pulse'
            : order.status === 'in_progress'
            ? 'bg-gradient-to-br from-coffee-800 to-coffee-900 text-white border-coffee-700'
            : 'bg-white text-coffee-900 border-coffee-200'
        }`}
      >
        <div className="inline-flex p-4 rounded-3xl bg-white/10 backdrop-blur-md mb-3 shadow-inner">
          {isReady ? (
            <PackageCheck className="w-12 h-12 text-amber-200 animate-bounce" />
          ) : order.status === 'in_progress' ? (
            <Coffee className="w-12 h-12 text-amber-200 animate-pulse" />
          ) : (
            <Clock className="w-12 h-12 text-coffee-700" />
          )}
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
          {isReady
            ? '🎉 กาแฟพร้อมรับแล้ว!'
            : order.status === 'in_progress'
            ? '☕ กำลังชงกาแฟของคุณ'
            : order.status === 'completed'
            ? '✅ รับเครื่องดื่มเรียบร้อย'
            : '⏳ ร้านได้รับออเดอร์แล้ว'}
        </h2>

        <p className="text-xs sm:text-sm mt-1.5 opacity-90 max-w-sm mx-auto">
          {isReady
            ? `เชิญรับเครื่องดื่มที่เคาน์เตอร์ร้าน ${order.shopId?.name} ได้เลยค่ะ`
            : `เวลานัดรับ: ${order.pickupTime} (ระบบอัปเดตแบบเรียลไทม์)`}
        </p>

        <div className="mt-4 inline-block">
          <StatusBadge status={order.status} size="lg" />
        </div>
      </div>

      {/* Realtime Stepper Progress Tracker */}
      <div className="coffee-card rounded-3xl p-5 border border-coffee-200/90 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-coffee-800 uppercase tracking-wider">
          ลำดับขั้นตอนการจัดทำ
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-coffee-200">
          {STEPS.map((step, idx) => {
            const isFinished = currentStepIndex >= idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={step.key} className="relative flex items-start space-x-3">
                {/* Step Circle Indicator */}
                <div
                  className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all ${
                    isFinished
                      ? 'bg-coffee-700 border-coffee-700 text-white shadow-sm'
                      : 'bg-white border-coffee-300 text-coffee-400'
                  } ${isCurrent ? 'ring-4 ring-coffee-400/30 scale-110' : ''}`}
                >
                  {isFinished ? '✓' : idx + 1}
                </div>

                <div className="flex-1">
                  <h4
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? 'text-coffee-900 font-extrabold'
                        : isFinished
                        ? 'text-coffee-800'
                        : 'text-coffee-400'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-coffee-500 mt-0.5">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pickup Shop Details Card */}
      <div className="coffee-card rounded-3xl p-4 border border-coffee-200 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-coffee-100">
          <div className="flex items-center space-x-2">
            <Store className="w-4 h-4 text-coffee-700" />
            <h4 className="font-bold text-xs text-coffee-900">
              {order.shopId?.name}
            </h4>
          </div>
          {order.shopId?.location && (
            <a
              href={`https://maps.google.com/?q=${order.shopId.location.lat},${order.shopId.location.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-coffee-700 hover:text-coffee-950 font-semibold flex items-center space-x-1"
            >
              <span>เปิดแผนที่</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="text-xs text-coffee-600 space-y-1">
          <p className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1.5 text-coffee-500 shrink-0" />
            <span>{order.shopId?.address}</span>
          </p>
          {order.shopId?.phone && (
            <p className="flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1.5 text-coffee-500 shrink-0" />
              <span>{order.shopId?.phone}</span>
            </p>
          )}
        </div>
      </div>

      {/* Order Item Details */}
      <div className="coffee-card rounded-3xl p-4 border border-coffee-200 space-y-3">
        <h4 className="font-bold text-xs text-coffee-800 uppercase tracking-wider">
          รายละเอียดเครื่องดื่ม ({order.items?.length} แก้ว)
        </h4>

        <div className="divide-y divide-coffee-100">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex space-x-3">
              <img
                src={item.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100'}
                alt={item.name}
                className="w-12 h-12 rounded-xl object-cover border border-coffee-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h5 className="font-bold text-xs text-coffee-900">
                    {item.name} x {item.quantity}
                  </h5>
                  <span className="font-bold text-xs text-coffee-900">
                    ฿{item.price * item.quantity}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-1 text-[10px] text-coffee-600">
                  <span className="bg-coffee-100 px-1.5 py-0.5 rounded">
                    {item.size}
                  </span>
                  <span className="bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded">
                    {item.intensityLabel}
                  </span>
                  <span className="bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded">
                    {item.sweetnessLabel}
                  </span>
                </div>
                {item.toppings?.length > 0 && (
                  <p className="text-[10px] text-coffee-500 mt-0.5">
                    + {item.toppings.map((t) => t.name).join(', ')}
                  </p>
                )}
                {item.notes && (
                  <p className="text-[10px] text-coffee-400 italic">
                    "{item.notes}"
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-coffee-200 flex justify-between items-center text-xs">
          <span className="text-coffee-600">ชำระด้วย: {order.paymentMethod?.toUpperCase()}</span>
          <div className="text-right">
            <span className="text-coffee-400 text-[10px] block">ยอดสุทธิ</span>
            <span className="text-base font-extrabold text-coffee-900">
              ฿{order.totalPrice}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
