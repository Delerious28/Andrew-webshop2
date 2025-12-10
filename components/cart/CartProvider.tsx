'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNotifications } from '../NotificationCenter';

export type CartItem = {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  category?: string;
};

interface CartContextValue {
  items: CartItem[];
  ready: boolean;
  subtotal: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'remoof-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { notify } = useNotifications();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch (error) {
        console.warn('Failed to parse cart storage', error);
      }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback(
    (incoming: CartItem) => {
      setItems((prev) => {
        const existing = prev.find((item) => item.productId === incoming.productId);
        if (existing) {
          return prev.map((item) =>
            item.productId === incoming.productId
              ? { ...item, quantity: item.quantity + incoming.quantity }
              : item
          );
        }
        return [...prev, incoming];
      });
      notify({
        title: 'Added to cart',
        message: `${incoming.title} (${incoming.quantity}x) is waiting in your bag`,
        tone: 'success'
      });
    },
    [notify]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      setItems((prev) => prev.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
    },
    []
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      notify({
        title: 'Removed from cart',
        message: 'Item removed from your cart',
        tone: 'info'
      });
    },
    [notify]
  );

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, ready, subtotal, addItem, updateQuantity, removeItem, clear }),
    [items, ready, subtotal, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
