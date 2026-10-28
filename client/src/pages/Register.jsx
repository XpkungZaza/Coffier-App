import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, Lock, Mail, User, Phone, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState('customer'); // 'customer' | 'shop_owner'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const loggedUser = await register({
        name,
        email,
        phone,
        password,
        role,
      });

      if (loggedUser.role === 'shop_owner') {
        navigate('/shop/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'การสมัครสมาชิกไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8">
      <div className="coffee-card rounded-3xl p-6 sm:p-8 max-w-md w-full border border-coffee-200 shadow-float space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-coffee-600 to-coffee-800 flex items-center justify-center text-white mx-auto shadow-soft">
            <Coffee className="w-6 h-6 text-coffee-200" />
          </div>
          <h1 className="text-2xl font-extrabold text-coffee-900 tracking-tight">
            สร้างบัญชีผู้ใช้ใหม่
          </h1>
          <p className="text-xs text-coffee-600">
            เริ่มต้นสัมผัสประสบการณ์สั่งกาแฟแบบกำหนดเอง
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="flex p-1 bg-coffee-100 rounded-2xl border border-coffee-200">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              role === 'customer'
                ? 'bg-white text-coffee-900 shadow-sm'
                : 'text-coffee-600 hover:text-coffee-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>ลูกค้า (Customer)</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('shop_owner')}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              role === 'shop_owner'
                ? 'bg-coffee-800 text-white shadow-sm'
                : 'text-coffee-600 hover:text-coffee-900'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>เจ้าของร้าน (Shop Owner)</span>
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-coffee-700 block mb-1">
              ชื่อ - นามสกุล
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="เช่น สมชาย ใจดี"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm"
              />
            </div>
          </div>

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
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-coffee-700 block mb-1">
              เบอร์โทรศัพท์
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-coffee-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="081-234-5678"
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
                placeholder="กำหนดรหัสผ่านอย่างน้อย 6 ตัวอักษร"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-coffee-200 text-xs text-coffee-900 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-coffee-800 hover:bg-coffee-900 text-white font-bold text-sm shadow-soft transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center space-x-1.5 mt-2"
          >
            <span>{loading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิก'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-coffee-600 pt-2 border-t border-coffee-100">
          มีบัญชีอยู่แล้ว?{' '}
          <Link
            to="/login"
            className="font-bold text-coffee-800 hover:text-coffee-950 underline"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </div>
  );
}
