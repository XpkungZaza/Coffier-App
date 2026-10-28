import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Store,
  Clock,
  Coffee,
  CheckCircle2,
  PackageCheck,
  AlertCircle,
  Plus,
  BarChart2,
  Settings,
  Flame,
  Volume2,
  RefreshCw,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';

export default function ShopDashboard() {
  const { user, isShopOwner } = useAuth();
  const { socket, setActiveShopId } = useSocket();
  const navigate = useNavigate();

  // Active Tab: 'orders' | 'menu' | 'reports' | 'settings'
  const [activeTab, setActiveTab] = useState('orders');

  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('active'); // 'active' | 'all' | 'pending' | 'in_progress' | 'ready' | 'completed'
  const [menuItems, setMenuItems] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State for adding/editing menu
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    category: 'latte',
    categoryNameTh: 'ลาเต้',
    beanType: 'Arabica',
    basePrice: 65,
    image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600',
    description: '',
    isSeasonal: false,
  });

  // Shop settings form state
  const [shopForm, setShopForm] = useState({
    name: '',
    address: '',
    openTime: '07:30',
    closeTime: '18:00',
    phone: '',
    description: '',
  });

  // Fetch shop, orders, menu and reports
  const fetchAllData = async () => {
    try {
      setLoading(true);
      // 1. Fetch shop info
      const shopRes = await api.get('/shops/my/shop');
      const currentShop = shopRes.shop;
      setShop(currentShop);
      setActiveShopId(currentShop._id);

      setShopForm({
        name: currentShop.name,
        address: currentShop.address,
        openTime: currentShop.openTime,
        closeTime: currentShop.closeTime,
        phone: currentShop.phone || '',
        description: currentShop.description || '',
      });

      // 2. Fetch orders
      const orderRes = await api.get('/orders/shop', {
        shopId: currentShop._id,
        status: orderFilter,
      });
      setOrders(orderRes.orders || []);

      // 3. Fetch menu
      const menuRes = await api.get(`/shops/${currentShop._id}/menu`);
      setMenuItems(menuRes.items || []);

      // 4. Fetch reports
      const reportRes = await api.get('/reports/sales', { shopId: currentShop._id });
      setReportData(reportRes);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isShopOwner) {
      navigate('/login?redirect=/shop/dashboard');
      return;
    }
    fetchAllData();
  }, [isShopOwner, orderFilter]);

  // Real-time listener for orders in shop
  useEffect(() => {
    if (!socket || !shop) return;

    const handleNewOrder = ({ order }) => {
      setOrders((prev) => [order, ...prev]);
    };

    const handleStatusUpdate = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [socket, shop]);

  // Change order status action (pending -> in_progress -> ready -> completed)
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? res.order : o))
      );
    } catch (err) {
      alert(err.message || 'ไม่สามารถอัปเดตสถานะได้');
    }
  };

  // Toggle menu availability
  const handleToggleMenu = async (menuId) => {
    try {
      const res = await api.patch(`/menu/${menuId}/toggle`);
      setMenuItems((prev) =>
        prev.map((m) => (m._id === menuId ? res.item : m))
      );
    } catch (err) {
      alert(err.message);
    }
  };

  // Delete menu item
  const handleDeleteMenu = async (menuId) => {
    if (!window.confirm('คุณต้องการลบเมนูนี้ใช่หรือไม่?')) return;
    try {
      await api.delete(`/menu/${menuId}`);
      setMenuItems((prev) => prev.filter((m) => m._id !== menuId));
    } catch (err) {
      alert(err.message);
    }
  };

  // Save (Create or Update) Menu Item
  const handleSaveMenu = async (e) => {
    e.preventDefault();
    try {
      if (editingMenuItem) {
        const res = await api.put(`/menu/${editingMenuItem._id}`, menuForm);
        setMenuItems((prev) =>
          prev.map((m) => (m._id === editingMenuItem._id ? res.item : m))
        );
      } else {
        const res = await api.post('/menu', { ...menuForm, shopId: shop._id });
        setMenuItems((prev) => [...prev, res.item]);
      }
      setShowMenuModal(false);
      setEditingMenuItem(null);
    } catch (err) {
      alert(err.message || 'บันทึกเมนูไม่สำเร็จ');
    }
  };

  // Save Shop Settings
  const handleSaveShopSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/shops/${shop._id}`, shopForm);
      setShop(res.shop);
      alert('บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว');
    } catch (err) {
      alert(err.message || 'บันทึกข้อมูลร้านไม่สำเร็จ');
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const brewingCount = orders.filter((o) => o.status === 'in_progress').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  return (
    <div className="pb-24 pt-4 px-4 max-w-6xl mx-auto space-y-6">
      {/* Top Banner Header for Shop Tablet/Desktop Experience */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-coffee-900 to-coffee-800 text-white p-5 sm:p-6 rounded-3xl shadow-float">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 text-coffee-950 flex items-center justify-center font-bold shadow-md">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">{shop?.name || 'แดชบอร์ดร้านกาแฟ'}</h1>
              <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>ระบบออนไลน์</span>
              </span>
            </div>
            <p className="text-xs text-coffee-200 mt-0.5">
              หน้าจอจัดการออเดอร์แบบเรียลไทม์และคิวเครื่องดื่ม
            </p>
          </div>
        </div>

        {/* Quick Counters */}
        <div className="flex items-center space-x-2 sm:space-x-3 self-start md:self-auto">
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 text-center">
            <span className="text-[10px] text-coffee-300 block">รอรับ</span>
            <span className="text-base font-extrabold text-amber-300">{pendingCount}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 text-center">
            <span className="text-[10px] text-coffee-300 block">กำลังชง</span>
            <span className="text-base font-extrabold text-blue-300">{brewingCount}</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/15 text-center">
            <span className="text-[10px] text-coffee-300 block">พร้อมรับ</span>
            <span className="text-base font-extrabold text-emerald-300">{readyCount}</span>
          </div>
          <button
            onClick={fetchAllData}
            className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar border-b border-coffee-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'orders'
              ? 'bg-coffee-700 text-white shadow-soft scale-105'
              : 'text-coffee-700 hover:bg-white'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>จัดการออเดอร์ & คิวเครื่องดื่ม ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'menu'
              ? 'bg-coffee-700 text-white shadow-soft scale-105'
              : 'text-coffee-700 hover:bg-white'
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>จัดการเมนู ({menuItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'reports'
              ? 'bg-coffee-700 text-white shadow-soft scale-105'
              : 'text-coffee-700 hover:bg-white'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>รายงานยอดขาย & สถิติ</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`py-2.5 px-4 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex items-center space-x-2 ${
            activeTab === 'settings'
              ? 'bg-coffee-700 text-white shadow-soft scale-105'
              : 'text-coffee-700 hover:bg-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>ข้อมูลร้านค้า</span>
        </button>
      </div>

      {/* TAB 1: ORDERS & QUEUE MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Order Filter Sub-tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5 p-1 bg-white rounded-2xl border border-coffee-200">
              {[
                { id: 'active', label: 'กำลังดำเนินการ (Active)' },
                { id: 'pending', label: 'รอรับออเดอร์' },
                { id: 'in_progress', label: 'กำลังชง' },
                { id: 'ready', label: 'พร้อมรับ' },
                { id: 'all', label: 'ทั้งหมด' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setOrderFilter(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    orderFilter === f.id
                      ? 'bg-coffee-700 text-white shadow-sm'
                      : 'text-coffee-600 hover:text-coffee-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <span className="text-xs text-coffee-600 font-medium">
              💡 เรียงตามลำดับเวลานัดรับที่ลูกค้ากำหนด
            </span>
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-coffee-200">
              <Coffee className="w-12 h-12 text-coffee-300 mx-auto mb-2" />
              <h3 className="text-base font-bold text-coffee-800">ไม่มีออเดอร์ในหมวดหมู่นี้</h3>
              <p className="text-xs text-coffee-500 mt-1">
                เมื่อมีลูกค้าสั่งกาแฟเข้ามา ระบบจะแจ้งเตือนและแสดงที่นี่ทันที
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {orders.map((order) => (
                <div
                  key={order._id}
                  className={`coffee-card rounded-3xl p-5 border space-y-4 shadow-sm transition-all ${
                    order.status === 'ready'
                      ? 'border-emerald-400 bg-emerald-50/20 ring-2 ring-emerald-300/40'
                      : order.status === 'in_progress'
                      ? 'border-blue-300 bg-blue-50/20'
                      : order.status === 'pending'
                      ? 'border-amber-300 bg-amber-50/30'
                      : 'border-coffee-200'
                  }`}
                >
                  {/* Order Top Meta */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-coffee-100">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-base text-coffee-900">
                          #{order.orderNumber}
                        </span>
                        <span className="text-xs font-bold text-accent-mint bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                          🕒 เวลารับ: {order.pickupTime}
                        </span>
                      </div>
                      <span className="text-[11px] text-coffee-500">
                        ลูกค้า: {order.userId?.name} ({order.userId?.phone || 'ไม่ระบุเบอร์'})
                      </span>
                    </div>

                    <StatusBadge status={order.status} size="md" />
                  </div>

                  {/* Drink Item List with Customization Details */}
                  <div className="space-y-2.5">
                    {order.items?.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-3 rounded-2xl border border-coffee-200/80 space-y-1.5"
                      >
                        <div className="flex items-start justify-between">
                          <h4 className="font-bold text-xs sm:text-sm text-coffee-950">
                            {item.name} x {item.quantity}
                          </h4>
                          <span className="font-bold text-xs text-coffee-900">
                            ฿{item.price * item.quantity}
                          </span>
                        </div>

                        {/* Detailed Recipe Specification */}
                        <div className="flex flex-wrap gap-1.5 text-[10px]">
                          <span className="px-2 py-0.5 rounded bg-coffee-100 font-bold text-coffee-800">
                            ขนาด: {item.size}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-100 font-bold text-amber-900">
                            ☕ {item.intensityLabel}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-100 font-bold text-blue-900">
                            🍯 {item.sweetnessLabel}
                          </span>
                          {item.toppings?.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded bg-purple-100 font-semibold text-purple-900"
                            >
                              + {t.name}
                            </span>
                          ))}
                        </div>

                        {item.notes && (
                          <div className="text-[11px] text-rose-700 bg-rose-50 px-2 py-1 rounded-lg font-medium">
                            โน้ตลูกค้า: "{item.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons to Advance Order Status */}
                  <div className="pt-2 border-t border-coffee-100 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-coffee-600">
                      ยอดรวม: <strong className="text-coffee-900 text-sm">฿{order.totalPrice}</strong> ({order.paymentMethod?.toUpperCase()})
                    </span>

                    <div className="flex items-center space-x-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'in_progress')}
                          className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-soft transition-all"
                        >
                          รับออเดอร์ & เริ่มชง ☕
                        </button>
                      )}

                      {order.status === 'in_progress' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'ready')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-soft transition-all ring-2 ring-emerald-300"
                        >
                          🎉 ทำเสร็จแล้ว (แจ้งลูกค้า)
                        </button>
                      )}

                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'completed')}
                          className="px-4 py-2 rounded-xl bg-stone-700 hover:bg-stone-800 text-white font-bold text-xs shadow-soft transition-all"
                        >
                          ✓ ลูกค้ารับเครื่องดื่มแล้ว
                        </button>
                      )}

                      {['pending', 'in_progress'].includes(order.status) && (
                        <button
                          onClick={() => {
                            if (window.confirm('คุณแน่ใจว่าต้องการยกเลิกออเดอร์นี้ใช่หรือไม่?')) {
                              handleUpdateStatus(order._id, 'cancelled');
                            }
                          }}
                          className="px-2.5 py-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 text-xs transition-colors"
                        >
                          ยกเลิก
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MENU MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-coffee-900">
                รายการเมนูทั้งหมดของร้าน ({menuItems.length} เมนู)
              </h2>
              <p className="text-xs text-coffee-600">
                เพิ่ม ลบ หรือแก้ไขราคา รูปภาพ และเปิด-ปิดการจำหน่ายได้แบบเรียลไทม์
              </p>
            </div>

            <button
              onClick={() => {
                setEditingMenuItem(null);
                setMenuForm({
                  name: '',
                  category: 'latte',
                  categoryNameTh: 'ลาเต้',
                  beanType: 'Arabica',
                  basePrice: 65,
                  image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600',
                  description: '',
                  isSeasonal: false,
                });
                setShowMenuModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-coffee-700 hover:bg-coffee-800 text-white font-bold text-xs shadow-soft flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มเมนูใหม่</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item._id}
                className="coffee-card rounded-3xl p-4 border border-coffee-200/90 flex flex-col justify-between space-y-3"
              >
                <div className="flex space-x-3.5">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 rounded-2xl object-cover border border-coffee-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-coffee-900 truncate">
                        {item.name}
                      </h4>
                    </div>
                    <span className="text-[10px] text-coffee-500 block">
                      {item.categoryNameTh} ({item.beanType})
                    </span>
                    <p className="text-xs text-coffee-600 line-clamp-1 mt-0.5">
                      {item.description || '-'}
                    </p>
                    <span className="text-sm font-extrabold text-coffee-900 mt-1 block">
                      ฿{item.basePrice}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-coffee-100 flex items-center justify-between">
                  {/* Availability Toggle */}
                  <button
                    onClick={() => handleToggleMenu(item._id)}
                    className="flex items-center space-x-1 text-xs font-semibold"
                  >
                    {item.isAvailable ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-emerald-600" />
                        <span className="text-emerald-700">พร้อมขาย</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-stone-400" />
                        <span className="text-stone-500">หมดชั่วคราว</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingMenuItem(item);
                        setMenuForm({
                          name: item.name,
                          category: item.category,
                          categoryNameTh: item.categoryNameTh,
                          beanType: item.beanType,
                          basePrice: item.basePrice,
                          image: item.image,
                          description: item.description,
                          isSeasonal: item.isSeasonal,
                        });
                        setShowMenuModal(true);
                      }}
                      className="p-1.5 text-coffee-600 hover:text-coffee-900 rounded-lg hover:bg-coffee-100"
                      title="แก้ไข"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMenu(item._id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      title="ลบ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SALES REPORTS & ANALYTICS (Recharts) */}
      {activeTab === 'reports' && reportData && (
        <div className="space-y-6">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="coffee-card rounded-3xl p-4 border border-coffee-200">
              <span className="text-[11px] text-coffee-500 font-medium">ยอดขายรวมทั้งหมด</span>
              <div className="text-2xl font-extrabold text-coffee-900 mt-1">
                ฿{reportData.summary?.totalRevenue?.toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold">
                +12% จากสัปดาห์ก่อน
              </span>
            </div>

            <div className="coffee-card rounded-3xl p-4 border border-coffee-200">
              <span className="text-[11px] text-coffee-500 font-medium">จำนวนออเดอร์ทั้งหมด</span>
              <div className="text-2xl font-extrabold text-coffee-900 mt-1">
                {reportData.summary?.totalOrders} ออเดอร์
              </div>
              <span className="text-[10px] text-coffee-500">
                เสร็จสิ้นแล้ว {reportData.summary?.completedOrders}
              </span>
            </div>

            <div className="coffee-card rounded-3xl p-4 border border-coffee-200">
              <span className="text-[11px] text-coffee-500 font-medium">ออเดอร์ค้างในระบบ</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">
                {reportData.summary?.pendingOrders} ออเดอร์
              </div>
              <span className="text-[10px] text-amber-600">กำลังทำ / พร้อมรับ</span>
            </div>

            <div className="coffee-card rounded-3xl p-4 border border-coffee-200">
              <span className="text-[11px] text-coffee-500 font-medium">ยอดเฉลี่ยต่อบิล</span>
              <div className="text-2xl font-extrabold text-coffee-900 mt-1">
                ฿{reportData.summary?.avgOrderValue}
              </div>
              <span className="text-[10px] text-coffee-500">ต่อการสั่งซื้อ</span>
            </div>
          </div>

          {/* Daily Revenue Trend Chart */}
          <div className="coffee-card rounded-3xl p-5 border border-coffee-200 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-coffee-900">
                  สถิติยอดขาย 7 วันย้อนหลัง (Daily Revenue Trend)
                </h3>
                <p className="text-xs text-coffee-500">รายได้รวมรายวัน (บาท)</p>
              </div>
              <TrendingUp className="w-5 h-5 text-accent-mint" />
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportData.dailyChartData}>
                  <defs>
                    <linearGradient id="coffeeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C19A6B" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#C19A6B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F5EBD7" />
                  <XAxis dataKey="day" stroke="#6F4E37" fontSize={12} />
                  <YAxis stroke="#6F4E37" fontSize={12} />
                  <Tooltip
                    formatter={(val) => [`฿${val}`, 'ยอดขาย']}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #C19A6B',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6F4E37"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#coffeeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top-Selling Menus Bar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="coffee-card rounded-3xl p-5 border border-coffee-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-coffee-900">
                    5 เมนูขายดีที่สุด (Top-Selling Drinks)
                  </h3>
                  <p className="text-xs text-coffee-500">เรียงตามจำนวนแก้วที่จำหน่าย</p>
                </div>
                <Flame className="w-5 h-5 text-accent-orange" />
              </div>

              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.topMenus} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#F5EBD7" />
                    <XAxis type="number" stroke="#6F4E37" fontSize={11} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#6F4E37"
                      fontSize={11}
                      width={120}
                      tick={{ fill: '#2C1810' }}
                    />
                    <Tooltip
                      formatter={(val) => [`${val} แก้ว`, 'จำนวน']}
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #C19A6B',
                      }}
                    />
                    <Bar dataKey="count" fill="#C19A6B" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Peak Hours Breakdown */}
            <div className="coffee-card rounded-3xl p-5 border border-coffee-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-coffee-900">
                    ช่วงเวลายอดนิยมในการรับเครื่องดื่ม (Peak Hours)
                  </h3>
                  <p className="text-xs text-coffee-500">ช่วยวางแผนจัดเตรียมวัตถุดิบและบาริสต้า</p>
                </div>
                <Clock className="w-5 h-5 text-coffee-600" />
              </div>

              <div className="space-y-3 pt-2">
                {reportData.hourlyData?.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-coffee-800">
                        {item.hour} ({item.label})
                      </span>
                      <span className="font-bold text-coffee-900">{item.orders} ออเดอร์</span>
                    </div>
                    <div className="w-full bg-coffee-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-coffee-700 h-2.5 rounded-full"
                        style={{ width: `${(item.orders / 40) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SHOP SETTINGS */}
      {activeTab === 'settings' && (
        <div className="coffee-card rounded-3xl p-6 border border-coffee-200 max-w-xl mx-auto space-y-4">
          <h2 className="text-base font-bold text-coffee-900 pb-2 border-b border-coffee-100">
            แก้ไขข้อมูลร้านกาแฟ
          </h2>

          <form onSubmit={handleSaveShopSettings} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-coffee-700 block mb-1">ชื่อร้าน</label>
              <input
                type="text"
                value={shopForm.name}
                onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-coffee-700 block mb-1">ที่อยู่ร้าน</label>
              <input
                type="text"
                value={shopForm.address}
                onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-coffee-700 block mb-1">เวลาเปิด</label>
                <input
                  type="time"
                  value={shopForm.openTime}
                  onChange={(e) => setShopForm({ ...shopForm, openTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-coffee-700 block mb-1">เวลาปิด</label>
                <input
                  type="time"
                  value={shopForm.closeTime}
                  onChange={(e) => setShopForm({ ...shopForm, closeTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-coffee-700 block mb-1">เบอร์ติดต่อ</label>
              <input
                type="tel"
                value={shopForm.phone}
                onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-coffee-700 block mb-1">คำอธิบายร้าน</label>
              <textarea
                rows={3}
                value={shopForm.description}
                onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-coffee-800 hover:bg-coffee-900 text-white font-bold text-sm shadow-soft transition-all"
            >
              บันทึกข้อมูลร้านค้า
            </button>
          </form>
        </div>
      )}

      {/* Menu Modal (Add / Edit) */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-coffee-200 shadow-float space-y-4">
            <h3 className="text-base font-bold text-coffee-900">
              {editingMenuItem ? 'แก้ไขเมนูเครื่องดื่ม' : 'เพิ่มเมนูเครื่องดื่มใหม่'}
            </h3>

            <form onSubmit={handleSaveMenu} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-coffee-700 block mb-1">ชื่อเมนู</label>
                <input
                  type="text"
                  required
                  value={menuForm.name}
                  onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                  placeholder="เช่น Iced Caramel Latte"
                  className="w-full px-3 py-2 rounded-xl border border-coffee-200 text-xs text-coffee-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-coffee-700 block mb-1">หมวดหมู่</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-coffee-200 text-xs text-coffee-900"
                  >
                    <option value="latte">ลาเต้</option>
                    <option value="americano">อเมริกาโน่</option>
                    <option value="cappuccino">คาปูชิโน่</option>
                    <option value="cold_brew">สกัดเย็น</option>
                    <option value="specialty">เมนูพิเศษ</option>
                    <option value="mocha">มอคค่า</option>
                    <option value="espresso">เอสเพรสโซ่</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-coffee-700 block mb-1">ราคาเริ่มต้น (฿)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={menuForm.basePrice}
                    onChange={(e) => setMenuForm({ ...menuForm, basePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-coffee-200 text-xs text-coffee-900"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-coffee-700 block mb-1">URL รูปภาพ</label>
                <input
                  type="url"
                  value={menuForm.image}
                  onChange={(e) => setMenuForm({ ...menuForm, image: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-coffee-200 text-xs text-coffee-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-coffee-700 block mb-1">คำอธิบาย</label>
                <textarea
                  rows={2}
                  value={menuForm.description}
                  onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-coffee-200 text-xs text-coffee-900"
                ></textarea>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="seasonal"
                  checked={menuForm.isSeasonal}
                  onChange={(e) => setMenuForm({ ...menuForm, isSeasonal: e.target.checked })}
                  className="rounded text-coffee-700"
                />
                <label htmlFor="seasonal" className="text-xs text-coffee-800 font-medium">
                  กำหนดเป็นเมนูพิเศษตามฤดูกาล (Seasonal Menu)
                </label>
              </div>

              <div className="flex space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMenuModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-coffee-200 text-xs text-coffee-700"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-coffee-800 hover:bg-coffee-900 text-white font-bold text-xs shadow-md"
                >
                  บันทึกเมนู
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
