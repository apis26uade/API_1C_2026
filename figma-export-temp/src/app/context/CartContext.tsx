import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { LocalCartItem, Product, Discount } from '../types';

interface CartContextType {
  items: LocalCartItem[];
  discount: Discount | null;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: number) => void;
  updateQty: (productId: number, qty: number) => void;
  clearCart: () => void;
  applyDiscount: (discount: Discount | null) => void;
  total: number;
  subtotal: number;
  discountAmount: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

const STORAGE_KEY = 'boho_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<LocalCartItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [discount, setDiscount] = useState<Discount | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product.idProduct === product.idProduct);
      if (existing) {
        return prev.map(i =>
          i.product.idProduct === product.idProduct
            ? { ...i, quantity: Math.min(i.quantity + qty, product.stock) }
            : i
        );
      }
      return [...prev, { product, quantity: qty }];
    });
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems(prev => prev.filter(i => i.product.idProduct !== productId));
  }, []);

  const updateQty = useCallback((productId: number, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.product.idProduct !== productId));
    } else {
      setItems(prev =>
        prev.map(i =>
          i.product.idProduct === productId ? { ...i, quantity: qty } : i
        )
      );
    }
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setDiscount(null);
  }, []);

  const applyDiscount = useCallback((d: Discount | null) => {
    setDiscount(d);
  }, []);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discountAmount = discount ? subtotal * (discount.percentage / 100) : 0;
  const total = subtotal - discountAmount;
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items, discount, addItem, removeItem, updateQty, clearCart, applyDiscount,
      subtotal, discountAmount, total, itemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
