import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Coffee, Lock, Mail, UserCheck, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loggedUser = await login(email, password);
      if (loggedUser.role === 'shop_owner') {
        navigate('/shop/dashboard');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userEmail, userPass) => {
    setEmail(userEmail);
    setPassword(userPass);
    try {
      setLoading(true);
      setError('');
      const loggedUser = await login(userEmail, userPass);
      if (loggedUser.role === 'shop_owner') {
        navigate('/shop/dashboard');
      } else {
        navigate(redirect);
      }
    } catch (err) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="coffee-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-coffee-200 shadow-float space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center text-white mx-auto shadow-soft">
            <Coffee className="w-6 h-6 text-coffee-200" />
          </div>
          <h1 className="text-2xl font-extrabold text-coffee-900 tracking-tight">
            เข้าสู่ระบบ Coffee Cup
          </h1>
          <p className="text-xs text-coffee-600">
            สั่งกาแฟล่วงหน้า ปรับแต่งรสชาติตามใจคุณ
          </p>
        </div>

        {/* Quick Demo Login Buttons */}
        <div className="bg-coffee-50/80 rounded-2xl p-3 border border-coffee-200/80 space-y-2">
          <span className="text-[10px] font-bold text-coffee-600 uppercase tracking-wider block text-center">
            ⚡ บัญชีทดสอบด่วน (คลิกเดียวเพื่อเข้าสู่ระบบ)
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@coffeecup.com', 'password123')}
              className="py-2 px-2.5 rounded-xl bg-white hover:bg-coffee-100/60 border border-coffee-200 text-[11px] font-semibold text-coffee-800 shadow-sm flex items-center justify-center space-x-1.5 transition-all"
            >
              <UserCheck className="w-3.5 h-3.5 text-coffee-600" />
              <span>ลูกค้าทดสอบ</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('owner@coffeecup.com', 'password123')}
              className="py-2 px-2.5 rounded-xl bg-accent-mint hover:bg-emerald-800 text-white text-[11px] font-semibold shadow-sm flex items-center justify-center space-x-1.5 transition-all"
            >
              <Store className="w-3.5 h-3.5 text-emerald-100" />
              <span>เจ้าของร้าน</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-coffee-700 block mb-1">
              อีเมล
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="customer@coffeecup.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-coffee-700 block mb-1">
              รหัสผ่าน
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-coffee-800 hover:bg-coffee-900 text-white font-bold text-sm shadow-soft transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center space-x-1.5"
          >
            <span>{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-coffee-600 pt-2 border-t border-coffee-100">
          ยังไม่มีบัญชีใช้งาน?{' '}
          <Link
            to="/register"
            className="font-bold text-coffee-800 hover:text-coffee-950 underline"
          >
            สมัครสมาชิกใหม่
          </Link>
        </div>
      </div>
    </div>
  );
}
