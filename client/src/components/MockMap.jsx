import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink } from 'lucide-react';

export default function MockMap({ shops = [], selectedShopId, onSelectShop }) {
  const [activePin, setActivePin] = useState(selectedShopId || (shops[0]?._id ?? null));

  // พิกัดผู้ใช้จำลอง: วิทยาลัยเทคนิคเชียงใหม่ (ถนนเวียงแก้ว) ตาม Concept Paper
  const userLocation = {
    name: 'ตำแหน่งของคุณ (วิทยาลัยเทคนิคเชียงใหม่)',
    lat: 18.7904,
    lng: 98.9847,
  };

  const handlePinClick = (shop) => {
    setActivePin(shop._id);
    if (onSelectShop) {
      onSelectShop(shop);
    }
  };

  return (
    <div className="relative w-full h-80 rounded-3xl overflow-hidden shadow-soft border border-coffee-200 bg-[#E8E0D2]">
      {/* Map Graphic Layer (Chiang Mai Old City Stylized Map) */}
      <svg className="w-full h-full absolute inset-0 opacity-40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#C19A6B" strokeWidth="0.8" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        {/* คูเมืองเชียงใหม่จำลอง (Square Moat of Chiang Mai) */}
        <rect
          x="15%"
          y="15%"
          width="70%"
          height="70%"
          fill="none"
          stroke="#4E878C"
          strokeWidth="6"
          rx="12"
          opacity="0.6"
        />
        {/* ถนนสายหลัก */}
        <line x1="0" y1="50%" x2="100%" y2="50%" stroke="#C19A6B" strokeWidth="3" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="#C19A6B" strokeWidth="3" />
      </svg>

      {/* Floating Header */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-sm border border-coffee-200 pointer-events-auto flex items-center space-x-2">
          <Compass className="w-4 h-4 text-coffee-600 animate-spin-slow" />
          <span className="text-xs font-semibold text-coffee-800">
            พิกัดร้านกาแฟในตัวเมืองเชียงใหม่
          </span>
        </div>

        <div className="bg-emerald-600 text-white text-[11px] font-medium px-2.5 py-1 rounded-xl shadow-sm pointer-events-auto flex items-center space-x-1">
          <Navigation className="w-3 h-3" />
          <span>GPS Active</span>
        </div>
      </div>

      {/* User Location Marker (Blue Dot) */}
      <div
        className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
        style={{ left: '50%', top: '48%' }}
        title={userLocation.name}
      >
        <div className="relative">
          <span className="animate-ping absolute inline-flex h-6 w-6 rounded-full bg-blue-400 opacity-75"></span>
          <div className="relative w-5 h-5 rounded-full bg-blue-600 border-2 border-white shadow-md flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white"></div>
          </div>
        </div>
        <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-blue-900 text-white text-[10px] px-2 py-0.5 rounded shadow opacity-90">
          คุณอยู่ที่นี่
        </div>
      </div>

      {/* Coffee Shop Pins */}
      {shops.map((shop, index) => {
        // จัดวาง Pin ตามลำดับเพื่อความสวยงามบนแผนที่จำลอง
        const offsets = [
          { left: '42%', top: '35%' },
          { left: '68%', top: '32%' },
          { left: '35%', top: '68%' },
        ];
        const pos = offsets[index % offsets.length];
        const isSelected = activePin === shop._id;

        return (
          <div
            key={shop._id}
            onClick={() => handlePinClick(shop)}
            className={`absolute z-20 transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-300 ${
              isSelected ? 'scale-125 z-30' : 'hover:scale-110'
            }`}
            style={{ left: pos.left, top: pos.top }}
          >
            <div className="flex flex-col items-center">
              <div
                className={`p-2 rounded-2xl shadow-float border transition-colors ${
                  isSelected
                    ? 'bg-coffee-800 text-white border-coffee-400 ring-4 ring-coffee-400/40'
                    : 'bg-white text-coffee-800 border-coffee-300 hover:bg-coffee-50'
                }`}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <span
                className={`mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap ${
                  isSelected
                    ? 'bg-coffee-900 text-white'
                    : 'bg-white/90 text-coffee-800 border border-coffee-200'
                }`}
              >
                {shop.name.split('(')[0]} ({shop.distanceKm ?? '1.2'} กม.)
              </span>
            </div>
          </div>
        );
      })}

      {/* Selected Shop Floating Info Card at Bottom */}
      {activePin && (
        <div className="absolute bottom-3 left-3 right-3 z-30 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-float border border-coffee-300 flex items-center justify-between">
          {(() => {
            const current = shops.find((s) => s._id === activePin) || shops[0];
            if (!current) return null;
            return (
              <>
                <div className="flex items-center space-x-3">
                  <img
                    src={current.image}
                    alt={current.name}
                    className="w-12 h-12 rounded-xl object-cover border border-coffee-200"
                  />
                  <div>
                    <h5 className="text-xs font-bold text-coffee-900 truncate max-w-[170px] sm:max-w-xs">
                      {current.name}
                    </h5>
                    <p className="text-[11px] text-coffee-600 truncate max-w-[200px]">
                      {current.address}
                    </p>
                    <span className="text-[10px] text-accent-mint font-semibold">
                      ระยะทางห่างประมาณ {current.distanceKm ?? '1.2'} กม. • เปิด {current.openTime} - {current.closeTime} น.
                    </span>
                  </div>
                </div>

                <a
                  href={`https://maps.google.com/?q=${current.location?.lat},${current.location?.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-coffee-700 hover:bg-coffee-800 text-white text-xs font-medium flex items-center space-x-1 shadow-sm transition-all whitespace-nowrap ml-2"
                >
                  <span>นำทาง</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
