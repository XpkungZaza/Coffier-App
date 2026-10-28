import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import {
  playReadySound,
  playNewOrderSound,
  showBrowserNotification,
  requestNotificationPermission,
} from '../services/notificationAudio';
import confetti from 'canvas-confetti';

const SocketContext = createContext();

const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin;

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [activeShopId, setActiveShopId] = useState(null);

  useEffect(() => {
    // ขออนุญาตส่งการแจ้งเตือนบนเบราว์เซอร์
    requestNotificationPermission();

    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 4000,
      reconnectionAttempts: 3,
      autoConnect: true,
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    // ลูกค้าเข้าร่วมห้องส่วนตัว
    socket.emit('join_user', user._id);

    // หากเป็นเจ้าของร้านและมีร้านค้า ให้เข้าร่วมห้องร้านค้า
    if (user.role === 'shop_owner' && activeShopId) {
      socket.emit('join_shop', activeShopId);
    }

    // ฟังก์ชันจัดการเมื่อสถานะออเดอร์เปลี่ยน
    const handleStatusUpdate = (order) => {
      console.log('[Socket Event] Order Status Updated:', order);
      let text = `ออเดอร์ #${order.orderNumber} สถานะเปลี่ยนเป็น: ${order.status}`;

      if (order.status === 'in_progress') {
        text = `☕ บาริสต้ากำลังชงเครื่องดื่ม #${order.orderNumber}`;
      } else if (order.status === 'ready') {
        text = `🎉 กาแฟของคุณพร้อมรับแล้ว! (ออเดอร์ #${order.orderNumber})`;
        playReadySound();
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
        showBrowserNotification('กาแฟของคุณพร้อมรับแล้ว! ☕', {
          body: `ออเดอร์ #${order.orderNumber} ทำเสร็จแล้ว สามารถไปรับที่ร้านได้เลย`,
        });
      } else if (order.status === 'completed') {
        text = `✅ รับเครื่องดื่ม #${order.orderNumber} เรียบร้อยแล้ว`;
      }

      setToastMessage({
        title: 'อัปเดตออเดอร์',
        message: text,
        type: order.status === 'ready' ? 'success' : 'info',
      });
    };

    // ฟังก์ชันจัดการเมื่อมีออเดอร์ใหม่เข้ามา (สำหรับร้านค้า)
    const handleNewOrder = ({ order, message }) => {
      console.log('[Socket Event] New Order for Shop:', order);
      playNewOrderSound();
      showBrowserNotification('🔔 มีออเดอร์ใหม่เข้ามา!', {
        body: `ออเดอร์ #${order.orderNumber} ยอดรวม ฿${order.totalPrice}`,
      });
      setToastMessage({
        title: 'ออเดอร์ใหม่เข้ามา!',
        message: `ออเดอร์ #${order.orderNumber} ยอดรวม ฿${order.totalPrice}`,
        type: 'shop_alert',
      });
    };

    socket.on('order_status_updated', handleStatusUpdate);
    socket.on('new_order', handleNewOrder);

    return () => {
      socket.off('order_status_updated', handleStatusUpdate);
      socket.off('new_order', handleNewOrder);
    };
  }, [socket, user, activeShopId]);

  // ตั้งเวลาปิด Toast อัตโนมัติ
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  return (
    <SocketContext.Provider value={{ socket, setActiveShopId }}>
      {children}
      {/* Realtime Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-full p-4 rounded-2xl shadow-float border transition-all transform animate-bounce bg-white/95 backdrop-blur-md border-coffee-400">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-coffee-800 text-sm">{toastMessage.title}</h4>
              <p className="text-coffee-600 text-xs mt-1">{toastMessage.message}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-coffee-400 hover:text-coffee-700 text-xs ml-2 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
