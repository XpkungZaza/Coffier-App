import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Store, SlidersHorizontal, Clock, User, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { isShopOwner } = useAuth();

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-coffee-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] px-2 py-2">
      <div className="flex items-center justify-around">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isActive
                ? 'text-coffee-800 font-semibold scale-105'
                : 'text-coffee-400 hover:text-coffee-600'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">หน้าหลัก</span>
        </NavLink>

        <NavLink
          to="/shops"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isActive
                ? 'text-coffee-800 font-semibold scale-105'
                : 'text-coffee-400 hover:text-coffee-600'
            }`
          }
        >
          <Store className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">ร้านกาแฟ</span>
        </NavLink>

        <NavLink
          to="/orders"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
              isActive
                ? 'text-coffee-800 font-semibold scale-105'
                : 'text-coffee-400 hover:text-coffee-600'
            }`
          }
        >
          <Clock className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">ประวัติสั่ง</span>
        </NavLink>

        {isShopOwner ? (
          <NavLink
            to="/shop/dashboard"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-accent-mint font-semibold scale-105'
                  : 'text-coffee-400 hover:text-coffee-600'
              }`
            }
          >
            <BarChart2 className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">แดชบอร์ด</span>
          </NavLink>
        ) : (
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-coffee-800 font-semibold scale-105'
                  : 'text-coffee-400 hover:text-coffee-600'
              }`
            }
          >
            <User className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">บัญชี</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
}
