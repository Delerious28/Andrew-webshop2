'use client';
import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { NotificationProvider } from '@/components/NotificationCenter';
import { CartProvider } from '@/components/cart/CartProvider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <CartProvider>{children}</CartProvider>
      </NotificationProvider>
    </SessionProvider>
  );
}
