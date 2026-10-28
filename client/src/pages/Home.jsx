import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Coffee,
  Sparkles,
  MapPin,
  Clock,
  ChevronRight,
  SlidersHorizontal,
  Flame,
  ArrowRight,
  Star,
  Plus,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Home() {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [shops, setShops] = useState([]);
  const [featuredMenus, setFeaturedMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // ดึงร้านค้าทั้งหมด (คำนวณระยะทางจากพิกัดเชียงใหม่)
        const shopRes = await api.get('/shops', { userLat: 18.7904, userLng: 98.9847 });
        setShops(shopRes.shops || []);

        // ดึงเมนูแนะนำจากร้านแรก
        if (shopRes.shops?.length > 0) {
          const menuRes = await api.get(`/shops/${shopRes.shops[0]._id}/menu`);
          setFeaturedMenus(menuRes.items?.slice(0, 4) || []);
        }
      } catch (err) {
        console.warn('Fetch home data error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const primaryShop = shops[0];

  return (
    <div className="pb-24 pt-4 px-4 max-w-5xl mx-auto space-y-6">
      {/* 1. Header Greeting & Credit Badge (ตาม Concept Paper ภาพที่ 1) */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-coffee-600 tracking-wider uppercase">
            ยินดีต้อนรับสู่ Coffee Cup
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-coffee-900 tracking-tight">
            อรุณสวัสดิ์, {user ? user.name.split(' ')[0] : 'นักดื่มกาแฟ'} ☕
          </h1>
        </div>

        {user && user.role === 'customer' && (
          <div className="bg-white/80 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-coffee-200 shadow-sm text-right">
            <span className="text-[10px] text-coffee-500 font-medium block">
              เครดิตของคุณ
            </span>
            <span className="text-sm font-bold text-coffee-800">
              ฿{user.credit?.toLocaleString() || 0}
            </span>
          </div>
        )}
      </div>

      {/* 2. Hero Banner: Morning Promotion & Customize Button (ตาม Wireframe หน้าที่ 1 ใน Paper) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-coffee-800 via-coffee-700 to-coffee-900 text-white p-6 sm:p-8 shadow-float">
        {/* Background Coffee Deco */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-coffee-500/20 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-lg">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-coffee-500/40 text-coffee-100 text-xs font-semibold tracking-wide border border-coffee-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>MORNING SALE • ดอยช้าง สเปเชียลตี้</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              สั่งกาแฟล่วงหน้า <br />
              <span className="text-coffee-300">ปรับความเข้มและความหวาน</span> ได้ดั่งใจ
            </h2>
            <p className="text-xs sm:text-sm text-coffee-100/90 leading-relaxed">
              ไม่ต้องยืนรอคิว เลือกร้าน กำหนดเวลารับ แล้วเดินไปรับกาแฟแก้วโปรดที่เคาน์เตอร์ได้ทันที
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              {/* ปุ่มเด่นตาม Concept Paper: Customize Your Coffee */}
              {primaryShop && (
                <Link
                  to={`/customize?shopId=${primaryShop._id}`}
                  className="px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-coffee-950 font-bold text-sm shadow-md transition-all hover:scale-[1.02] flex items-center space-x-2"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Customize Your Coffee</span>
                </Link>
              )}

              <Link
                to="/shops"
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm backdrop-blur-md border border-white/20 transition-all flex items-center space-x-1.5"
              >
                <span>ค้นหาร้านกาแฟใกล้คุณ</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Cup Mock Visual */}
          <div className="hidden sm:flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-center min-w-[160px]">
            <div className="w-20 h-20 rounded-full bg-coffee-600/60 flex items-center justify-center text-3xl shadow-inner mb-2 animate-bounce">
              ☕
            </div>
            <span className="text-xs font-bold text-amber-200">เริ่มที่ ฿50</span>
            <span className="text-[11px] text-coffee-200">Arabica 100%</span>
          </div>
        </div>
      </div>

      {/* 3. Recommended Menus (ตาม Wireframe หน้าที่ 1 ใน Paper) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Flame className="w-5 h-5 text-accent-orange" />
            <h3 className="text-lg font-bold text-coffee-900">เมนูแนะนำยอดนิยม</h3>
          </div>
          {primaryShop && (
            <Link
              to={`/shops/${primaryShop._id}`}
              className="text-xs font-medium text-coffee-600 hover:text-coffee-900 flex items-center"
            >
              ดูทั้งหมด ({primaryShop.name.split('(')[0]})
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-coffee-100/60 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {featuredMenus.map((menu) => (
              <div
                key={menu._id}
                className="coffee-card rounded-2xl p-3 flex flex-col justify-between group hover:shadow-float transition-all border border-coffee-200"
              >
                <div className="relative rounded-xl overflow-hidden mb-2.5 aspect-square bg-coffee-100">
                  <img
                    src={menu.image}
                    alt={menu.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {menu.isSeasonal && (
                    <span className="absolute top-1.5 left-1.5 bg-accent-orange text-white text-[10px] font-semibold px-1.5 py-0.5 rounded shadow">
                      เมนูพิเศษ
                    </span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-medium px-1.5 py-0.5 rounded">
                    {menu.beanType}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-coffee-900 line-clamp-1 group-hover:text-coffee-700">
                    {menu.name}
                  </h4>
                  <p className="text-[11px] text-coffee-500 line-clamp-1 mt-0.5">
                    {menu.description || menu.categoryNameTh}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-coffee-100 flex items-center justify-between">
                  <span className="font-extrabold text-sm text-coffee-900">
                    ฿{menu.basePrice}
                  </span>
                  <Link
                    to={`/customize?shopId=${primaryShop?._id}&menuId=${menu._id}`}
                    className="p-1.5 rounded-xl bg-coffee-100 hover:bg-coffee-600 hover:text-white text-coffee-800 transition-colors"
                    title="ปรับแต่งเครื่องดื่มนี้"
                  >
                    <Plus className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Participating Coffee Shops (ร้านกาแฟที่เข้าร่วม) */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-coffee-700" />
            <h3 className="text-lg font-bold text-coffee-900">ร้านกาแฟใกล้คุณ (เชียงใหม่)</h3>
          </div>
          <Link
            to="/shops"
            className="text-xs font-medium text-coffee-600 hover:text-coffee-900 flex items-center"
          >
            ดูบนแผนที่
            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {shops.map((shop) => (
            <Link
              key={shop._id}
              to={`/shops/${shop._id}`}
              className="coffee-card rounded-3xl overflow-hidden hover:shadow-float transition-all border border-coffee-200/80 group flex flex-col"
            >
              <div className="relative h-36 overflow-hidden">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-bold text-coffee-900 flex items-center space-x-1 shadow-sm">
                  <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>{shop.rating}</span>
                </div>

                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <h4 className="font-bold text-sm leading-tight drop-shadow-sm">
                    {shop.name}
                  </h4>
                </div>
              </div>

              <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                <p className="text-xs text-coffee-600 line-clamp-1">
                  {shop.address}
                </p>

                <div className="flex items-center justify-between text-[11px] pt-1 border-t border-coffee-100">
                  <div className="flex items-center text-accent-mint font-semibold">
                    <MapPin className="w-3 h-3 mr-1" />
                    <span>~{shop.distanceKm ?? '1.2'} กม. จากคุณ</span>
                  </div>
                  <div className="flex items-center text-coffee-500">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{shop.openTime} - {shop.closeTime} น.</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
