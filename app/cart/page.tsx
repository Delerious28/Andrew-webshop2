'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { CreditCard, ShieldCheck, ShoppingBag, Wand2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { CartItemRow } from '@/components/cart/CartItemRow';
import { useCart } from '@/components/cart/CartProvider';
import { useNotifications } from '@/components/NotificationCenter';

export default function CartPage() {
  const { items, subtotal, ready, clear } = useCart();
  const { status } = useSession();
  const { notify } = useNotifications();
  const [processing, setProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!items.length) {
      notify({ title: 'Cart is empty', message: 'Add a product before checking out.', tone: 'warning' });
      return;
    }
    if (status !== 'authenticated') {
      notify({ title: 'Sign in required', message: 'Sign in to continue to Stripe checkout.', tone: 'info' });
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
          addressId: 'pending-address'
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Checkout failed');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        notify({ title: 'Checkout pending', message: 'Stripe keys not configured yet. Please add them to env.', tone: 'info' });
      }
    } catch (error: any) {
      notify({ title: 'Stripe checkout unavailable', message: error.message || 'Configure your Stripe keys to continue.', tone: 'warning' });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-brand font-semibold">Build your ride</p>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShoppingBag className="h-7 w-7 text-brand" /> Your Cart
        </h1>
        <p className="text-slate-600 dark:text-slate-300">Add, tweak, or remove parts before you hand off to Stripe.</p>
      </header>

      <div className="grid lg:grid-cols-[2fr,1fr] gap-6">
        <div className="space-y-4">
          <AnimatePresence>
            {ready && items.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center space-y-4 bg-white/70 dark:bg-slate-900/60"
              >
                <Wand2 className="h-8 w-8 mx-auto text-brand" />
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold">Your cart is ready for a glow-up</h2>
                  <p className="text-sm text-slate-500">Add precision components and we will guide you into Stripe checkout.</p>
                </div>
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand text-white px-4 py-2 font-semibold shadow hover:shadow-lg"
                >
                  Browse products
                </Link>
              </motion.div>
            ) : (
              items.map((item) => <CartItemRow key={item.productId} item={item} />)
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-5 bg-white/80 dark:bg-slate-900/70 shadow">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">Subtotal</p>
              <p className="text-2xl font-bold">${(subtotal / 100).toFixed(2)}</p>
            </div>
            <p className="text-xs text-slate-500">Taxes and shipping will be calculated at checkout.</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-brand" />
                <span>Stripe payments ready once API keys are added.</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Securely handle cards; we never store payment details.</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={processing || !items.length}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white px-4 py-3 font-semibold shadow-lg hover:shadow-2xl transition disabled:opacity-60"
            >
              {processing ? 'Connecting to Stripe…' : 'Proceed to checkout'}
            </button>
            {items.length > 0 && (
              <button
                onClick={clear}
                className="mt-3 w-full text-sm text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                Clear cart
              </button>
            )}
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/70 dark:bg-slate-900/60 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold mb-1">Need an address?</p>
            <p>Save a shipping address in your profile. We will attach it to the Stripe session once keys are live.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
