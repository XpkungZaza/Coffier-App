import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Phone,
  Star,
  ChevronLeft,
  SlidersHorizontal,
  Sparkles,
  ShoppingBag,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'latte', label: 'ลาเต้ (Latte)' },
  { id: 'americano', label: 'อเมริกาโน่ (Americano)' },
  { id: 'cappuccino', label: 'คาปูชิโน่ (Cappuccino)' },
  { id: 'cold_brew', label: 'สกัดเย็น (Cold Brew)' },
  { id: 'specialty', label: 'เมนูพิเศษ (Specialty)' },
  { id: 'mocha', label: 'มอคค่า (Mocha)' },
  { id: 'espresso', label: 'เอสเพรสโซ่ (Espresso)' },
];

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { totalItems, totalPrice } = useCart();

  const [shop, setShop] = useState(null);
  const [menus, setMenus] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShopAndMenu = async () => {
      try {
        setLoading(true);
        const shopRes = await api.get(`/shops/${id}`);
        setShop(shopRes.shop);

        const menuRes = await api.get(`/shops/${id}/menu`, {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
        });
        setMenus(menuRes.items || []);
      } catch (err) {
        console.warn('Error loading shop detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShopAndMenu();
  }, [id, selectedCategory]);

  if (loading && !shop) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <div className="h-48 rounded-3xl bg-coffee-100 animate-pulse"></div>
        <div className="h-8 w-48 bg-coffee-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-2 px-4 max-w-5xl mx-auto space-y-5">
      {/* Back Button & Shop Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-float">
        <img
          src={shop?.image}
          alt={shop?.name}
          className="w-full h-56 sm:h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

        {/* Back Link */}
        <Link
          to="/shops"
          className="absolute top-4 left-4 p-2 rounded-2xl bg-white/80 hover:bg-white backdrop-blur-md text-coffee-900 shadow-md transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-coffee-900 flex items-center space-x-1 shadow-md">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{shop?.rating}</span>
        </div>

        {/* Shop Info Overlay */}
        <div className="absolute bottom-4 left-4 right-4 text-white space-y-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300">
            Specialty Coffee Partner
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold leading-tight">
            {shop?.name}
          </h1>
          <p className="text-xs text-coffee-100/90 line-clamp-1">
            {shop?.description}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-coffee-200">
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-amber-400" />
              {shop?.address}
            </span>
            <span className="flex items-center">
              <Clock className="w-3.5 h-3.5 mr-1 text-amber-400" />
              เปิด {shop?.openTime} - {shop?.closeTime} น.
            </span>
            {shop?.phone && (
              <span className="flex items-center">
                <Phone className="w-3.5 h-3.5 mr-1 text-amber-400" />
                {shop?.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Category Filter Horizontal Scroll */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold text-coffee-600 uppercase tracking-wider">
          เลือกประเภทเครื่องดื่ม
        </h2>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-coffee-700 text-white shadow-soft scale-105'
                  : 'bg-white text-coffee-700 border border-coffee-200 hover:border-coffee-400'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-coffee-900">
            รายการเครื่องดื่ม ({menus.length} รายการ)
          </h2>
          <span className="text-xs text-coffee-500">
            กดที่เมนูเพื่อปรับความเข้มและความหวาน
          </span>
        </div>

        {menus.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-coffee-200">
            <p className="text-coffee-600 text-sm">ไม่พบรายการเมนูในหมวดหมู่นี้</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {menus.map((item) => (
              <div
                key={item._id}
                className="coffee-card rounded-3xl p-3.5 flex flex-col justify-between border border-coffee-200/90 hover:shadow-float transition-all group"
              >
                <div className="flex space-x-3.5">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 bg-coffee-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {item.isSeasonal && (
                      <span className="absolute top-1 left-1 bg-accent-orange text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                        ตามฤดูกาล
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-sm text-coffee-900 group-hover:text-coffee-700">
                        {item.name}
                      </h4>
                    </div>

                    <p className="text-[11px] text-coffee-500 line-clamp-2">
                      {item.description || 'เมล็ดกาแฟคุณภาพเยี่ยม ปรับรสชาติได้ตามใจ'}
                    </p>

                    <div className="flex items-center space-x-1.5 text-[10px] text-coffee-600 pt-0.5">
                      <span className="px-1.5 py-0.5 rounded bg-coffee-100 font-medium">
                        {item.beanType}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 font-medium">
                        ปรับความหวาน/เข้มได้
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-coffee-100 flex items-center justify-between">
                  <div className="leading-tight">
                    <span className="text-[10px] text-coffee-400 block">เริ่มต้น</span>
                    <span className="text-base font-extrabold text-coffee-900">
                      ฿{item.basePrice}
                    </span>
                  </div>

                  <Link
                    to={`/customize?shopId=${shop._id}&menuId=${item._id}`}
                    className="px-3.5 py-2 rounded-xl bg-coffee-700 hover:bg-coffee-800 text-white text-xs font-semibold shadow-soft flex items-center space-x-1.5 transition-all hover:scale-[1.02]"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>ปรับแต่ง & สั่ง</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Sticky Bottom Cart Trigger if items present */}
      {totalItems > 0 && (
        <div className="fixed bottom-16 sm:bottom-6 left-4 right-4 z-40 max-w-md mx-auto">
          <Link
            to="/cart"
            className="w-full py-3.5 px-5 rounded-2xl bg-coffee-900 text-white shadow-float border border-coffee-600/50 flex items-center justify-between hover:bg-coffee-950 transition-all hover:scale-[1.01]"
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-accent-orange flex items-center justify-center font-bold text-xs text-white">
                {totalItems}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">ตะกร้าของคุณ</p>
                <p className="text-[10px] text-coffee-300">คลิกเพื่อดูสรุปและชำระเงิน</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold">฿{totalPrice}</span>
              <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-xl">
                ดูตะกร้า →
              </span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
