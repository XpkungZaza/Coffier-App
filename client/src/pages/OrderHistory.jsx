import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  RotateCcw,
  Store,
  ChevronRight,
  ExternalLink,
  ShoppingBag,
  Coffee,
  CheckCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';

export default function OrderHistory() {
  const { user } = useAuth();
  const { reorder } = useCart();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await api.get('/orders/my');
        setOrders(res.orders || []);
      } catch (err) {
        console.warn('Fetch my orders failed:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleReorder = (order) => {
    reorder(order);
    navigate('/cart');
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
        <Coffee className="w-16 h-16 text-coffee-400 mb-3" />
        <h2 className="text-xl font-bold text-coffee-900">กรุณาเข้าสู่ระบบ</h2>
        <p className="text-xs text-coffee-600 max-w-xs mt-1 mb-6">
          เข้าสู่ระบบเพื่อดูประวัติการสั่งกาแฟและสั่งซ้ำเมนูโปรดของคุณ
        </p>
        <Link
          to="/login?redirect=/orders"
          className="px-6 py-2.5 rounded-2xl bg-coffee-700 hover:bg-coffee-800 text-white font-semibold text-xs shadow-soft"
        >
          เข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-4 px-4 max-w-3xl mx-auto space-y-5">
      {/* Page Header (ตาม Concept Paper ภาพที่ 2: หน้าประวัติรายการที่เคยสั่งซื้อ) */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-coffee-600 uppercase tracking-wider">
            Your Orders
          </span>
          <h1 className="text-2xl font-extrabold text-coffee-900">
            ประวัติการสั่งซื้อ
          </h1>
        </div>
        <span className="text-xs font-semibold text-coffee-500 bg-white px-3 py-1 rounded-full border border-coffee-200 shadow-sm">
          {orders.length} ออเดอร์
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-3xl bg-coffee-100 animate-pulse"></div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-coffee-200">
          <Coffee className="w-12 h-12 text-coffee-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-coffee-800">ยังไม่มีประวัติการสั่งซื้อ</h3>
          <p className="text-xs text-coffee-500 mt-1 mb-5">
            ลองสั่งกาแฟแก้วแรกของคุณพร้อมปรับแต่งรสชาติที่ถูกใจได้เลย
          </p>
          <Link
            to="/shops"
            className="px-5 py-2.5 rounded-2xl bg-coffee-700 hover:bg-coffee-800 text-white font-semibold text-xs shadow-soft"
          >
            เลือกร้านกาแฟ
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const isActive = ['pending', 'in_progress', 'ready'].includes(order.status);

            return (
              <div
                key={order._id}
                className="coffee-card rounded-3xl p-4 sm:p-5 border border-coffee-200/90 shadow-soft hover:shadow-float transition-all space-y-3.5"
              >
                {/* Order Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-coffee-100">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-coffee-950">
                      #{order.orderNumber}
                    </span>
                    <span className="text-[11px] text-coffee-500">
                      • {new Date(order.createdAt).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <StatusBadge status={order.status} size="sm" />
                </div>

                {/* Shop Name & Pickup Time */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 text-coffee-800 font-semibold">
                    <Store className="w-4 h-4 text-coffee-600" />
                    <span>{order.shopId?.name}</span>
                  </div>
                  <span className="text-accent-mint font-medium">
                    เวลารับ: {order.pickupTime}
                  </span>
                </div>

                {/* Drinks List in this order */}
                <div className="space-y-1.5 pt-1">
                  {order.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs flex items-center justify-between bg-coffee-50/60 p-2 rounded-xl"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span className="font-bold text-coffee-900 truncate">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-coffee-500">
                          ({item.size}, {item.intensityLabel?.split('•')[0]}, {item.sweetness})
                        </span>
                      </div>
                      <span className="font-semibold text-coffee-800 shrink-0 ml-2">
                        x{item.quantity} (฿{item.price * item.quantity})
                      </span>
                    </div>
                  ))}
                </div>

                {/* Bottom Actions & Reorder Button */}
                <div className="pt-2 border-t border-coffee-100 flex items-center justify-between">
                  <div className="leading-tight">
                    <span className="text-[10px] text-coffee-400 block">ยอดรวมทั้งสิ้น</span>
                    <span className="text-base font-extrabold text-coffee-900">
                      ฿{order.totalPrice}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {/* View Live Tracking if still active */}
                    {isActive && (
                      <Link
                        to={`/orders/${order._id}`}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-coffee-950 font-bold text-xs shadow-sm flex items-center space-x-1 transition-all"
                      >
                        <Clock className="w-3.5 h-3.5" />
                        <span>ติดตามสถานะสด</span>
                      </Link>
                    )}

                    {/* ปุ่ม "สั่งซ้ำ" (Reorder Button) ตาม Concept Paper */}
                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-coffee-700 hover:bg-coffee-800 text-white font-semibold text-xs shadow-soft flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>สั่งซ้ำ</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
