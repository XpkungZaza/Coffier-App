import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('coffeecup_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedShop, setSelectedShop] = useState(() => {
    try {
      const saved = localStorage.getItem('coffeecup_shop');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [pickupType, setPickupType] = useState('immediate'); // 'immediate' | 'scheduled'
  const [pickupTime, setPickupTime] = useState('รับทันที (10-15 นาที)');

  useEffect(() => {
    localStorage.setItem('coffeecup_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (selectedShop) {
      localStorage.setItem('coffeecup_shop', JSON.stringify(selectedShop));
    } else {
      localStorage.removeItem('coffeecup_shop');
    }
  }, [selectedShop]);

  const addToCart = (customizedItem, shop) => {
    // หากเลือกสั่งจากร้านใหม่ จะอัปเดตร้านให้ตรงกัน
    if (!selectedShop || selectedShop._id !== shop._id) {
      setSelectedShop(shop);
      setCartItems([customizedItem]);
    } else {
      // ตรวจสอบว่ามีรายการที่ปรับแต่งเหมือนกันเป๊ะหรือไม่
      const existingIdx = cartItems.findIndex(
        (i) =>
          i.menuItemId === customizedItem.menuItemId &&
          i.size === customizedItem.size &&
          i.intensity === customizedItem.intensity &&
          i.sweetness === customizedItem.sweetness &&
          JSON.stringify(i.toppings) === JSON.stringify(customizedItem.toppings) &&
          i.notes === customizedItem.notes
      );

      if (existingIdx > -1) {
        const updated = [...cartItems];
        updated[existingIdx].quantity += customizedItem.quantity || 1;
        setCartItems(updated);
      } else {
        setCartItems([...cartItems, customizedItem]);
      }
    }
  };

  const removeFromCart = (index) => {
    const updated = cartItems.filter((_, idx) => idx !== index);
    setCartItems(updated);
    if (updated.length === 0) {
      // ปล่อย selectedShop ไว้หรือคงเดิมเพื่อความสะดวก
    }
  };

  const updateQuantity = (index, delta) => {
    const updated = [...cartItems];
    const newQty = updated[index].quantity + delta;
    if (newQty <= 0) {
      removeFromCart(index);
    } else {
      updated[index].quantity = newQty;
      setCartItems(updated);
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('coffeecup_cart');
  };

  // ฟีเจอร์สั่งซ้ำ (Reorder)
  const reorder = (order) => {
    if (order.shopId) {
      setSelectedShop(order.shopId);
    }
    const items = order.items.map((item) => ({
      ...item,
      quantity: item.quantity || 1,
    }));
    setCartItems(items);
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedShop,
        setSelectedShop,
        pickupType,
        setPickupType,
        pickupTime,
        setPickupTime,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        reorder,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
