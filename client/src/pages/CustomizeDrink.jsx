import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Coffee,
  Check,
  Plus,
  Minus,
  Sparkles,
  ShoppingBag,
  Info,
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const SIZES = [
  { id: 'Tall', name: 'Tall (12 oz)', oz: '12 oz', extraPrice: 0 },
  { id: 'Grande', name: 'Grande (16 oz)', oz: '16 oz', extraPrice: 15 },
  { id: 'Venti', name: 'Venti (20 oz)', oz: '20 oz', extraPrice: 25 },
];

const INTENSITY_OPTIONS = [
  {
    id: 'light',
    level: 25,
    name: 'อ่อน (Light)',
    shots: 1,
    volume: '30 ml',
    desc: 'รสชาตินุ่ม ละมุน ไม่ขม ดื่มง่าย',
    extraPrice: 0,
  },
  {
    id: 'medium',
    level: 50,
    name: 'ปานกลาง (Medium)',
    shots: 2,
    volume: '60 ml',
    desc: 'กลมกล่อมลงตัว สูตรมาตรฐานของร้าน',
    extraPrice: 0,
  },
  {
    id: 'dark',
    level: 85,
    name: 'เข้ม (Dark)',
    shots: 3,
    volume: '90 ml',
    desc: 'เข้มข้นสะใจ บอดี้หนัก ตื่นเต็มตา',
    extraPrice: 15,
  },
];

const SWEETNESS_OPTIONS = [
  {
    id: '0%',
    level: 0,
    name: '0% (ไม่หวาน)',
    sugar: '0 กรัม',
    pump: '0 ปั๊ม',
    desc: 'เพลิดเพลินกับรสกาแฟแท้ 100%',
  },
  {
    id: '25%',
    level: 25,
    name: '25% (หวานน้อย)',
    sugar: '5 กรัม',
    pump: '1 ปั๊ม',
    desc: 'หวานละมุนบางเบาเพื่อสุขภาพ',
  },
  {
    id: '50%',
    level: 50,
    name: '50% (หวานปกติ)',
    sugar: '10 กรัม',
    pump: '2 ปั๊ม',
    desc: 'สูตรมาตรฐาน อร่อยกลมกล่อม',
  },
  {
    id: '100%',
    level: 100,
    name: '100% (หวานมาก)',
    sugar: '20 กรัม',
    pump: '4 ปั๊ม',
    desc: 'หอมหวานเข้มข้นจุใจ',
  },
];

const AVAILABLE_TOPPINGS = [
  { id: 'caramel', name: 'Caramel Syrup', price: 15, icon: '🍯' },
  { id: 'vanilla', name: 'Vanilla Syrup', price: 15, icon: '🌼' },
  { id: 'hazelnut', name: 'Hazelnut Syrup', price: 15, icon: '🌰' },
  { id: 'oat_milk', name: 'Oat Milk (นมข้าวโอ๊ต)', price: 20, icon: '🌾' },
  { id: 'coffee_jelly', name: 'Coffee Jelly (เจลลี่กาแฟ)', price: 15, icon: '🧋' },
  { id: 'whipped_cream', name: 'Whipped Cream (วิปครีม)', price: 15, icon: '🍦' },
  { id: 'extra_shot', name: 'Extra Shot Espresso', price: 20, icon: '☕' },
];

export default function CustomizeDrink() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const shopId = searchParams.get('shopId');
  const menuId = searchParams.get('menuId');

  const [shop, setShop] = useState(null);
  const [menuItem, setMenuItem] = useState(null);
  const [loading, setLoading] = useState(true);

  // States การปรับแต่ง
  const [size, setSize] = useState('Grande');
  const [intensity, setIntensity] = useState('medium');
  const [sweetness, setSweetness] = useState('50%');
  const [toppings, setToppings] = useState([]);
  const [notes, setNotes] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!shopId) {
          navigate('/shops');
          return;
        }

        const shopRes = await api.get(`/shops/${shopId}`);
        setShop(shopRes.shop);

        const menuRes = await api.get(`/shops/${shopId}/menu`);
        const items = menuRes.items || [];

        if (menuId) {
          const selected = items.find((i) => i._id === menuId);
          setMenuItem(selected || items[0]);
        } else if (items.length > 0) {
          setMenuItem(items[0]);
        }
      } catch (err) {
        console.warn('Load customize page failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [shopId, menuId]);

  // คำนวณราคาแบบเรียลไทม์
  const basePrice = menuItem ? menuItem.basePrice : 60;
  const sizeExtra = SIZES.find((s) => s.id === size)?.extraPrice || 0;
  const intensityExtra = INTENSITY_OPTIONS.find((i) => i.id === intensity)?.extraPrice || 0;
  const toppingsTotal = toppings.reduce((sum, t) => sum + t.price, 0);

  const unitPrice = basePrice + sizeExtra + intensityExtra + toppingsTotal;
  const totalPrice = unitPrice * quantity;

  const toggleTopping = (top) => {
    if (toppings.some((t) => t.id === top.id)) {
      setToppings(toppings.filter((t) => t.id !== top.id));
    } else {
      setToppings([...toppings, top]);
    }
  };

  const handleAddToCart = () => {
    if (!menuItem || !shop) return;

    const selectedIntensityObj = INTENSITY_OPTIONS.find((i) => i.id === intensity);
    const selectedSweetnessObj = SWEETNESS_OPTIONS.find((s) => s.id === sweetness);

    const customizedItem = {
      menuItemId: menuItem._id,
      name: menuItem.name,
      image: menuItem.image,
      size,
      intensity,
      intensityLabel: `${selectedIntensityObj.name} • ${selectedIntensityObj.shots} Shots (${selectedIntensityObj.volume})`,
      sweetness,
      sweetnessLabel: `${selectedSweetnessObj.name} • ${selectedSweetnessObj.pump}`,
      toppings: toppings.map((t) => ({ name: t.name, price: t.price })),
      notes,
      price: unitPrice,
      quantity,
    };

    addToCart(customizedItem, shop);
    navigate('/cart');
  };

  if (loading || !menuItem) {
    return (
      <div className="max-w-2xl mx-auto p-4 space-y-4">
        <div className="h-64 rounded-3xl bg-coffee-100 animate-pulse"></div>
        <div className="h-10 bg-coffee-100 rounded-2xl animate-pulse"></div>
      </div>
    );
  }

  const currentIntensity = INTENSITY_OPTIONS.find((i) => i.id === intensity);
  const currentSweetness = SWEETNESS_OPTIONS.find((s) => s.id === sweetness);

  return (
    <div className="pb-32 pt-2 px-4 max-w-2xl mx-auto space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/shops/${shopId}`}
          className="p-2 rounded-2xl bg-white border border-coffee-200 text-coffee-800 shadow-sm hover:bg-coffee-50 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <div className="text-center">
          <span className="text-[11px] font-semibold text-coffee-500 uppercase tracking-wider block">
            {shop?.name}
          </span>
          <h1 className="text-base font-extrabold text-coffee-900">
            ปรับแต่งเครื่องดื่ม (Customize)
          </h1>
        </div>
        <div className="w-9"></div>
      </div>

      {/* Coffee Interactive Visualizer & Formula Preview (อิงภาพ Concept Paper หน้าที่ 5) */}
      <div className="coffee-card rounded-3xl p-5 border border-coffee-200/90 shadow-soft relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Animated Cup Representation */}
          <div className="relative w-32 h-36 flex flex-col items-center justify-end p-2 bg-gradient-to-b from-amber-50 to-coffee-100/60 rounded-3xl border border-coffee-200 shrink-0">
            {/* Steam Animation */}
            <div className="absolute top-2 flex space-x-1 animate-steam">
              <span className="w-1 h-3 bg-coffee-400 rounded-full blur-[0.5px]"></span>
              <span className="w-1 h-4 bg-coffee-400 rounded-full blur-[0.5px]"></span>
              <span className="w-1 h-2 bg-coffee-400 rounded-full blur-[0.5px]"></span>
            </div>

            {/* Cup Graphic */}
            <div
              className={`w-24 transition-all duration-300 rounded-b-2xl border-2 border-coffee-700 bg-white relative overflow-hidden flex flex-col justify-end shadow-md ${
                size === 'Venti' ? 'h-28' : size === 'Grande' ? 'h-24' : 'h-20'
              }`}
            >
              {/* Coffee Layer (Intensity-based color) */}
              <div
                className="w-full transition-all duration-500 rounded-b-xl"
                style={{
                  height: `${currentIntensity.level}%`,
                  backgroundColor:
                    intensity === 'dark' ? '#2C1810' : intensity === 'medium' ? '#6F4E37' : '#9E7148',
                }}
              ></div>
              {/* Foam/Milk Layer */}
              <div className="absolute top-0 inset-x-0 h-3 bg-amber-50/90 border-b border-amber-200"></div>
            </div>

            <span className="text-[10px] font-bold text-coffee-700 mt-1">
              {size} ({currentIntensity.shots} Shots)
            </span>
          </div>

          {/* Recipe Parameter Summary Card (ตาม Concept Paper: Arabica, Topping, ความเข้ม 25, ความหวาน 78) */}
          <div className="flex-1 space-y-1.5 text-xs text-coffee-700 bg-white/80 p-3.5 rounded-2xl border border-coffee-100 w-full">
            <div className="flex items-center justify-between font-bold text-sm text-coffee-950 pb-1 border-b border-coffee-100">
              <span>{menuItem.name}</span>
              <span className="text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-full text-[11px]">
                {menuItem.beanType}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-coffee-400 block">ระดับความเข้ม</span>
                <span className="font-semibold text-coffee-800">
                  {currentIntensity.name} ({currentIntensity.shots} ช็อต)
                </span>
              </div>
              <div>
                <span className="text-coffee-400 block">ระดับความหวาน</span>
                <span className="font-semibold text-coffee-800">
                  {currentSweetness.name} ({currentSweetness.pump})
                </span>
              </div>
              <div>
                <span className="text-coffee-400 block">ขนาดแก้ว</span>
                <span className="font-semibold text-coffee-800">
                  {size}
                </span>
              </div>
              <div>
                <span className="text-coffee-400 block">ท็อปปิ้งเพิ่ม</span>
                <span className="font-semibold text-coffee-800 truncate block">
                  {toppings.length > 0 ? toppings.map((t) => t.name).join(', ') : 'ไม่มี'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Cup Size Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-coffee-800 uppercase tracking-wider">
          1. เลือกขนาดแก้ว (Size)
        </label>
        <div className="grid grid-cols-3 gap-2.5">
          {SIZES.map((s) => (
            <button
              key={s.id}
              onClick={() => setSize(s.id)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                size === s.id
                  ? 'bg-coffee-700 text-white border-coffee-700 shadow-soft scale-[1.02]'
                  : 'bg-white text-coffee-800 border-coffee-200 hover:border-coffee-400'
              }`}
            >
              <div className="font-bold text-xs sm:text-sm">{s.name}</div>
              <div className="text-[11px] opacity-80 mt-0.5">
                {s.extraPrice > 0 ? `+฿${s.extraPrice}` : 'ราคาปกติ'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Coffee Intensity Selection (3 ระดับตาม Paper) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-coffee-800 uppercase tracking-wider">
            2. เลือกระดับความเข้ม (Coffee Intensity)
          </label>
          <span className="text-[11px] text-coffee-500 font-medium">
            คำนวณช็อตเอสเพรสโซ่อัตโนมัติ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {INTENSITY_OPTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => setIntensity(item.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                intensity === item.id
                  ? 'bg-coffee-800 text-white border-coffee-800 shadow-soft ring-2 ring-coffee-400/40'
                  : 'bg-white text-coffee-800 border-coffee-200 hover:border-coffee-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs">{item.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-900 font-bold">
                  {item.shots} Shot
                </span>
              </div>
              <p
                className={`text-[11px] mt-1 line-clamp-1 ${
                  intensity === item.id ? 'text-coffee-200' : 'text-coffee-500'
                }`}
              >
                {item.desc}
              </p>
              {item.extraPrice > 0 && (
                <span className="text-[10px] text-amber-300 font-medium block mt-1">
                  +฿{item.extraPrice}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Sweetness Level Selection (4 ระดับตาม Paper) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-coffee-800 uppercase tracking-wider">
            3. เลือกระดับความหวาน (Sweetness Level)
          </label>
          <span className="text-[11px] text-coffee-500 font-medium">
            คำนวณปริมาณน้ำตาล/ไซรัป
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SWEETNESS_OPTIONS.map((item) => (
            <button
              key={item.id}
              onClick={() => setSweetness(item.id)}
              className={`p-3 rounded-2xl border text-center transition-all ${
                sweetness === item.id
                  ? 'bg-coffee-700 text-white border-coffee-700 shadow-soft'
                  : 'bg-white text-coffee-800 border-coffee-200 hover:border-coffee-400'
              }`}
            >
              <div className="font-bold text-xs">{item.name}</div>
              <div className="text-[10px] opacity-75 mt-0.5">{item.pump}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Add On / Topping Selection (ตาม Concept Paper ภาพที่ 5) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-coffee-800 uppercase tracking-wider">
          4. ท็อปปิ้งและไซรัปเพิ่มเติม (Toppings & Syrups)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {AVAILABLE_TOPPINGS.map((top) => {
            const isSelected = toppings.some((t) => t.id === top.id);
            return (
              <button
                key={top.id}
                onClick={() => toggleTopping(top)}
                className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-amber-50 text-coffee-950 border-amber-400 ring-1 ring-amber-300'
                    : 'bg-white text-coffee-700 border-coffee-200 hover:border-coffee-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{top.icon}</span>
                  <span className="text-xs font-semibold">{top.name}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-coffee-900">+฿{top.price}</span>
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                      isSelected
                        ? 'bg-coffee-700 text-white'
                        : 'border border-coffee-300 text-transparent'
                    }`}
                  >
                    <Check className="w-3 h-3" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Special Notes */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-coffee-800 uppercase tracking-wider">
          5. ข้อความถึงบาริสต้า (Special Instructions)
        </label>
        <input
          type="text"
          placeholder="เช่น แยกน้ำแข็ง, นำแก้วมาเอง, ไม่รับหลอด..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm"
        />
      </div>

      {/* Floating Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-coffee-200/80 p-4 shadow-float">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center space-x-2 bg-coffee-50 p-1.5 rounded-2xl border border-coffee-200">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-8 h-8 rounded-xl bg-white text-coffee-800 shadow-sm flex items-center justify-center hover:bg-coffee-100 disabled:opacity-40"
              disabled={quantity <= 1}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center font-bold text-xs text-coffee-900">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-8 h-8 rounded-xl bg-white text-coffee-800 shadow-sm flex items-center justify-center hover:bg-coffee-100"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-coffee-700 to-coffee-800 hover:from-coffee-800 hover:to-coffee-900 text-white font-bold text-sm shadow-soft transition-all hover:scale-[1.01] flex items-center justify-between"
          >
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-4 h-4" />
              <span>เพิ่มลงในตะกร้า</span>
            </div>
            <span className="text-base font-extrabold text-amber-300">
              ฿{totalPrice}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
