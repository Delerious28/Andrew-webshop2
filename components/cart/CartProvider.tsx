'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNotifications } from '../NotificationCenter';
import { useSession } from 'next-auth/react';

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
  totalQuantity: number;
  addItem: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);
const STORAGE_KEY = 'remoof-cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { notify } = useNotifications();
  const { status } = useSession();
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function syncServerCart() {
      try {
        const res = await fetch('/api/cart');
        if (!res.ok) throw new Error('Unable to fetch cart');
        const serverItems = await res.json();
        const mapped = serverItems.map((item: any) => ({
          productId: item.productId,
          title: item.product?.title ?? 'Product',
          price: item.product?.price ?? 0,
          quantity: item.quantity,
          image: item.product?.images?.[0]?.url,
          category: item.product?.category
        })) as CartItem[];
        setItems(mapped);
      } catch (error) {
        console.warn('Failed to sync server cart', error);
      } finally {
        setReady(true);
      }
    }

    if (status === 'authenticated') {
      syncServerCart();
    }

    if (status === 'unauthenticated') {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        try {
          setItems(JSON.parse(stored));
        } catch (error) {
          console.warn('Failed to parse cart storage', error);
        }
      }
      setReady(true);
    }
  }, [status]);

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

      if (status === 'authenticated') {
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: incoming.productId, quantity: incoming.quantity })
        }).catch((error) => console.warn('Failed to persist cart', error));
      }

      notify({
        title: 'Added to cart',
        message: `${incoming.title} (${incoming.quantity}x) is waiting in your bag`,
        tone: 'success'
      });
    },
    [notify, status]
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      let delta = 0;
      setItems((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (!existing) return prev;
        delta = quantity - existing.quantity;
        return prev.map((item) => (item.productId === productId ? { ...item, quantity } : item));
      });

      if (status === 'authenticated' && delta !== 0) {
        fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity: delta })
        }).catch((error) => console.warn('Failed to update cart quantity', error));
      }
    },
    [status]
  );

  const removeItem = useCallback(
    (productId: string) => {
      setItems((prev) => prev.filter((item) => item.productId !== productId));

      if (status === 'authenticated') {
        fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId })
        }).catch((error) => console.warn('Failed to remove cart item', error));
      }

      notify({
        title: 'Removed from cart',
        message: 'Item removed from your cart',
        tone: 'info'
      });
    },
    [notify, status]
  );

  const clear = useCallback(() => {
    setItems([]);
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.price * item.quantity, 0), [items]);
  const totalQuantity = useMemo(() => items.reduce((sum, item) => sum + item.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, ready, subtotal, totalQuantity, addItem, updateQuantity, removeItem, clear }),
    [items, ready, subtotal, totalQuantity, addItem, updateQuantity, removeItem, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
