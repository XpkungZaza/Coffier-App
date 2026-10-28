// API Service Helper สำหรับเรียกใช้งาน REST API ฝั่ง Backend
// พร้อมระบบ Fallback อัตโนมัติเมื่อรันบน Vercel Preview (Demo Mode)

import {
  MOCK_SHOPS,
  MOCK_MENUS,
  MOCK_ORDERS,
  MOCK_REPORT,
} from './mockFallbackData';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('coffeecup_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const buildUrl = (endpoint, params = {}) => {
  let urlString = API_BASE_URL.startsWith('http')
    ? `${API_BASE_URL}${endpoint}`
    : `${window.location.origin}${API_BASE_URL}${endpoint}`;

  const url = new URL(urlString);
  Object.keys(params).forEach((key) => {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      url.searchParams.append(key, params[key]);
    }
  });
  return url.toString();
};

// Fallback logic สำหรับกรณีทดสอบบน Vercel ที่ยังไม่ได้ตั้งค่า Backend
const getFallbackData = (method, endpoint, body) => {
  console.info(`[Demo Fallback Mode] Serving mock data for ${method} ${endpoint}`);

  if (endpoint.startsWith('/shops/my/shop')) {
    return { success: true, shop: MOCK_SHOPS[0] };
  }
  if (endpoint.startsWith('/shops/') && endpoint.endsWith('/menu')) {
    return { success: true, count: MOCK_MENUS.length, items: MOCK_MENUS };
  }
  if (endpoint.startsWith('/shops/') && !endpoint.includes('menu')) {
    const id = endpoint.split('/')[2];
    const shop = MOCK_SHOPS.find((s) => s._id === id) || MOCK_SHOPS[0];
    return { success: true, shop };
  }
  if (endpoint.startsWith('/shops')) {
    return { success: true, shops: MOCK_SHOPS };
  }
  if (endpoint.startsWith('/auth/me')) {
    const savedUser = localStorage.getItem('coffeecup_user');
    const user = savedUser
      ? JSON.parse(savedUser)
      : {
          _id: 'usr-1',
          name: 'กิตติศักดิ์ ชัยมงคล (ลูกค้าทดสอบ)',
          email: 'customer@coffeecup.com',
          role: 'customer',
          credit: 650,
          phone: '081-234-5678',
        };
    return { success: true, user };
  }
  if (endpoint.startsWith('/auth/login') || endpoint.startsWith('/auth/register')) {
    const isOwner = body?.email?.includes('owner') || body?.role === 'shop_owner';
    const user = {
      _id: isOwner ? 'usr-owner' : 'usr-cust',
      name: isOwner ? 'สมชาย คอฟฟี่มาสเตอร์ (เจ้าของร้าน)' : (body?.name || 'กิตติศักดิ์ ชัยมงคล'),
      email: body?.email || 'customer@coffeecup.com',
      role: isOwner ? 'shop_owner' : 'customer',
      credit: isOwner ? 0 : 650,
      phone: body?.phone || '081-234-5678',
    };
    localStorage.setItem('coffeecup_user', JSON.stringify(user));
    return {
      success: true,
      token: 'mock-jwt-token-' + Date.now(),
      user,
    };
  }
  if (endpoint.startsWith('/auth/topup')) {
    return { success: true, credit: 1000 };
  }
  if (endpoint.startsWith('/orders/my')) {
    const localOrders = JSON.parse(localStorage.getItem('coffeecup_local_orders') || '[]');
    return { success: true, count: MOCK_ORDERS.length + localOrders.length, orders: [...localOrders, ...MOCK_ORDERS] };
  }
  if (endpoint.startsWith('/orders/shop')) {
    const localOrders = JSON.parse(localStorage.getItem('coffeecup_local_orders') || '[]');
    return { success: true, count: MOCK_ORDERS.length + localOrders.length, orders: [...localOrders, ...MOCK_ORDERS] };
  }
  if (endpoint.startsWith('/orders/') && !endpoint.includes('status')) {
    const id = endpoint.split('/')[2];
    const localOrders = JSON.parse(localStorage.getItem('coffeecup_local_orders') || '[]');
    const found = [...localOrders, ...MOCK_ORDERS].find((o) => o._id === id) || MOCK_ORDERS[0];
    return { success: true, order: found };
  }
  if (endpoint === '/orders' && method === 'POST') {
    const newOrder = {
      _id: 'ord-' + Date.now(),
      orderNumber: 'CC-' + Math.floor(1000 + Math.random() * 9000),
      shopId: MOCK_SHOPS[0],
      items: body.items,
      totalPrice: body.totalPrice,
      pickupType: body.pickupType,
      pickupTime: body.pickupTime,
      status: 'pending',
      paymentMethod: body.paymentMethod,
      paymentStatus: 'paid',
      createdAt: new Date().toISOString(),
    };
    const localOrders = JSON.parse(localStorage.getItem('coffeecup_local_orders') || '[]');
    localStorage.setItem('coffeecup_local_orders', JSON.stringify([newOrder, ...localOrders]));
    return { success: true, message: 'สั่งซื้อสำเร็จ', order: newOrder };
  }
  if (endpoint.startsWith('/orders/') && endpoint.endsWith('/status')) {
    const id = endpoint.split('/')[2];
    const localOrders = JSON.parse(localStorage.getItem('coffeecup_local_orders') || '[]');
    const target = [...localOrders, ...MOCK_ORDERS].find((o) => o._id === id) || MOCK_ORDERS[0];
    target.status = body.status;
    return { success: true, order: target };
  }
  if (endpoint.startsWith('/reports/sales')) {
    return { success: true, ...MOCK_REPORT };
  }
  if (endpoint.startsWith('/payments/mock')) {
    return { success: true, status: 'paid', transactionId: 'TXN-MOCK-' + Date.now() };
  }
  if (endpoint.startsWith('/menu')) {
    return { success: true, item: { ...body, _id: 'm-' + Date.now() } };
  }

  return { success: true };
};

export const api = {
  async get(endpoint, params = {}) {
    try {
      const response = await fetch(buildUrl(endpoint, params), {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Endpoint not available');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return getFallbackData('GET', endpoint, params);
    }
  },

  async post(endpoint, body = {}) {
    try {
      const response = await fetch(buildUrl(endpoint), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Endpoint not available');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return getFallbackData('POST', endpoint, body);
    }
  },

  async put(endpoint, body = {}) {
    try {
      const response = await fetch(buildUrl(endpoint), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Endpoint not available');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return getFallbackData('PUT', endpoint, body);
    }
  },

  async patch(endpoint, body = {}) {
    try {
      const response = await fetch(buildUrl(endpoint), {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Endpoint not available');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return getFallbackData('PATCH', endpoint, body);
    }
  },

  async delete(endpoint) {
    try {
      const response = await fetch(buildUrl(endpoint), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType || !contentType.includes('application/json')) {
        throw new Error('Endpoint not available');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      return getFallbackData('DELETE', endpoint, {});
    }
  },
};
