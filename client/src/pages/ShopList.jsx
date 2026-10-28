import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Clock, Phone, Star, Navigation, Map, ListFilter } from 'lucide-react';
import { api } from '../services/api';
import MockMap from '../components/MockMap';

export default function ShopList() {
  const [shops, setShops] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('both'); // 'both' | 'list' | 'map'
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        // ส่งพิกัดของผู้ใช้จำลอง (วิทยาลัยเทคนิคเชียงใหม่)
        const res = await api.get('/shops', {
          search: searchTerm,
          userLat: 18.7904,
          userLng: 98.9847,
        });
        setShops(res.shops || []);
        if (res.shops?.length > 0 && !selectedShopId) {
          setSelectedShopId(res.shops[0]._id);
        }
      } catch (err) {
        console.warn('Fetch shops failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [searchTerm]);

  return (
    <div className="pb-24 pt-4 px-4 max-w-5xl mx-auto space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-coffee-600 uppercase tracking-wider">
            Chiang Mai Coffee Network
          </span>
          <h1 className="text-2xl font-extrabold text-coffee-900">
            เลือกร้านกาแฟใกล้คุณ
          </h1>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 p-1 bg-white rounded-2xl border border-coffee-200 shadow-sm self-start sm:self-auto">
          <button
            onClick={() => setViewMode('both')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'both' ? 'bg-coffee-700 text-white shadow-sm' : 'text-coffee-600 hover:text-coffee-900'
            }`}
          >
            ทั้งสอง
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'list' ? 'bg-coffee-700 text-white shadow-sm' : 'text-coffee-600 hover:text-coffee-900'
            }`}
          >
            รายการ
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              viewMode === 'map' ? 'bg-coffee-700 text-white shadow-sm' : 'text-coffee-600 hover:text-coffee-900'
            }`}
          >
            แผนที่
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-coffee-400" />
        <input
          type="text"
          placeholder="ค้นหาร้านกาแฟตามชื่อหรือทำเล เช่น Lanna, นิมมาน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-coffee-200 text-coffee-900 placeholder-coffee-400 focus:outline-none focus:ring-2 focus:ring-coffee-500 shadow-sm text-sm"
        />
      </div>

      {/* Interactive Map Section */}
      {(viewMode === 'both' || viewMode === 'map') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-coffee-600 font-medium px-1">
            <span className="flex items-center">
              <Map className="w-3.5 h-3.5 mr-1 text-coffee-700" />
              แผนที่แสดงตำแหน่งและระยะทางจริง
            </span>
            <span>จุดสีฟ้า = ตำแหน่งของคุณ</span>
          </div>
          <MockMap
            shops={shops}
            selectedShopId={selectedShopId}
            onSelectShop={(shop) => setSelectedShopId(shop._id)}
          />
        </div>
      )}

      {/* Shop Cards List */}
      {(viewMode === 'both' || viewMode === 'list') && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-coffee-800">
            รายชื่อร้านค้าที่ร่วมรายการ ({shops.length} ร้าน)
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-coffee-100/60 animate-pulse"></div>
              ))}
            </div>
          ) : shops.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-coffee-200">
              <p className="text-coffee-600 text-sm">ไม่พบร้านกาแฟที่ตรงกับคำค้นหา</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shops.map((shop) => {
                const isSelected = selectedShopId === shop._id;
                return (
                  <div
                    key={shop._id}
                    onClick={() => setSelectedShopId(shop._id)}
                    className={`coffee-card rounded-3xl p-4 flex flex-col justify-between border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-coffee-500 ring-2 ring-coffee-400/30 shadow-md'
                        : 'border-coffee-200 hover:border-coffee-300'
                    }`}
                  >
                    <div className="flex space-x-3.5">
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-24 h-24 rounded-2xl object-cover border border-coffee-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between">
                          <h3 className="font-bold text-sm sm:text-base text-coffee-900 truncate">
                            {shop.name}
                          </h3>
                          <div className="flex items-center space-x-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full shrink-0 ml-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>{shop.rating}</span>
                          </div>
                        </div>

                        <p className="text-xs text-coffee-600 line-clamp-1">
                          {shop.description}
                        </p>

                        <div className="flex items-center text-xs text-coffee-500 space-x-2 pt-1">
                          <span className="flex items-center text-accent-mint font-semibold">
                            <MapPin className="w-3.5 h-3.5 mr-0.5" />
                            ~{shop.distanceKm ?? '1.2'} กม.
                          </span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-0.5" />
                            {shop.openTime} - {shop.closeTime} น.
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-coffee-100 flex items-center justify-between">
                      <span className="text-[11px] text-coffee-500 truncate max-w-[200px]">
                        {shop.address}
                      </span>
                      <Link
                        to={`/shops/${shop._id}`}
                        className="px-4 py-2 rounded-xl bg-coffee-700 hover:bg-coffee-800 text-white text-xs font-semibold shadow-soft transition-all hover:scale-[1.02] shrink-0"
                      >
                        สั่งกาแฟร้านนี้
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
