import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Coffee, ShoppingBag, User as UserIcon, Wallet, LogOut, Store, Bell, PlusCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isShopOwner, topUpCredit } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [topupAmount, setTopupAmount] = useState(100);

  const handleTopup = async () => {
    try {
      await topUpCredit(topupAmount);
      setShowTopupModal(false);
      alert(`เติมเงินสำเร็จ ฿${topupAmount}!`);
    } catch (err) {
      alert(err.message || 'เติมเงินไม่สำเร็จ');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream-bg/90 backdrop-blur-md border-b border-coffee-200/80 shadow-sm transition-all">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
              <Coffee className="w-5 h-5 text-coffee-200" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-coffee-900 group-hover:text-coffee-700 transition-colors">
                Coffee Cup
              </span>
              <span className="hidden sm:inline-block text-[10px] font-medium text-coffee-500 uppercase tracking-widest ml-2 px-1.5 py-0.5 rounded bg-coffee-100">
                Integrated Ordering
              </span>
            </div>
          </Link>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {user ? (
              <>
                {/* User Wallet Balance */}
                {user.role === 'customer' && (
                  <button
                    onClick={() => setShowTopupModal(true)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-coffee-100/90 hover:bg-coffee-200 text-coffee-800 text-xs font-medium border border-coffee-300 transition-all shadow-sm"
                    title="คลิกเพื่อเติมเงินในกระเป๋า"
                  >
                    <Wallet className="w-3.5 h-3.5 text-coffee-600" />
                    <span>฿{user.credit?.toLocaleString() || 0}</span>
                    <PlusCircle className="w-3 h-3 text-coffee-600 hover:text-coffee-800" />
                  </button>
                )}

                {/* Shop Owner Switcher */}
                {isShopOwner && (
                  <Link
                    to="/shop/dashboard"
                    className="hidden md:flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-accent-mint text-white text-xs font-medium hover:bg-opacity-95 shadow-soft transition-all"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>จัดการร้าน</span>
                  </Link>
                )}

                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-xl bg-white hover:bg-coffee-50 text-coffee-800 border border-coffee-200 shadow-sm transition-all"
                  aria-label="ตะกร้ากาแฟ"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-orange text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-md animate-pulse">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {/* User Profile / Logout */}
                <div className="flex items-center space-x-2 pl-1 border-l border-coffee-200">
                  <div className="hidden sm:block text-right">
                    <p className="text-xs font-semibold text-coffee-900 leading-none truncate max-w-[120px]">
                      {user.name}
                    </p>
                    <span className="text-[10px] text-coffee-600">
                      {user.role === 'shop_owner' ? 'เจ้าของร้าน' : 'ลูกค้าทั่วไป'}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-coffee-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    title="ออกจากระบบ"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-medium text-coffee-800 hover:text-coffee-950 transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-coffee-700 hover:bg-coffee-800 text-white text-xs font-medium shadow-soft transition-all hover:scale-[1.02]"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Topup Modal */}
      {showTopupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-float border border-coffee-200 animate-scale-up">
            <h3 className="text-lg font-bold text-coffee-900 flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-coffee-600" />
              เติมเงินเข้ากระเป๋าเครดิต
            </h3>
            <p className="text-xs text-coffee-600 mt-1">
              จำลองการเติมเครดิตในแอปเพื่อใช้สั่งกาแฟโดยไม่ต้องรูดบัตร
            </p>

            <div className="grid grid-cols-3 gap-2.5 my-5">
              {[50, 100, 200, 300, 500, 1000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopupAmount(amt)}
                  className={`py-2 rounded-xl text-sm font-semibold border transition-all ${
                    topupAmount === amt
                      ? 'bg-coffee-600 text-white border-coffee-600 shadow-md'
                      : 'bg-coffee-50 text-coffee-800 border-coffee-200 hover:border-coffee-400'
                  }`}
                >
                  ฿{amt}
                </button>
              ))}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowTopupModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-coffee-200 text-coffee-700 text-sm font-medium hover:bg-coffee-50 transition-all"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleTopup}
                className="flex-1 py-2.5 rounded-xl bg-coffee-700 text-white text-sm font-medium hover:bg-coffee-800 transition-all shadow-md"
              >
                ยืนยัน ฿{topupAmount}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
