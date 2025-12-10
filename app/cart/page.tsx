'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { PageShell } from '@/components/PageShell';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { data: session, status } = useSession();
  const { items, ready, subtotal, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  if (status === 'loading' || !ready) {
    return (
      <PageShell>
        <p className="text-slate-600 dark:text-slate-300">Loading cart...</p>
      </PageShell>
    );
  }

  if (!session) {
    return (
      <PageShell>
        <div className="space-y-4 max-w-2xl">
          <h1 className="text-4xl font-bold">Your Cart</h1>
          <p className="text-slate-600 dark:text-slate-300">Please sign in to view and manage your cart.</p>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-white font-semibold shadow hover:-translate-y-0.5 transition"
          >
            Sign in
          </Link>
        </div>
      </PageShell>
    );
  }

  if (items.length === 0) {
    return (
      <PageShell>
        <div className="space-y-4 max-w-3xl">
          <h1 className="text-4xl font-bold">Your Cart</h1>
          <p className="text-slate-600 dark:text-slate-300">Your cart is empty.</p>
          <div className="card-surface p-10 text-center space-y-4">
            <div className="mx-auto h-20 w-20 rounded-full bg-brand/10 flex items-center justify-center text-brand text-3xl">🛒</div>
            <p className="text-lg font-semibold">No items yet</p>
            <p className="text-slate-600 dark:text-slate-300">Browse the catalogue and add components to see them here.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-white font-semibold shadow hover:-translate-y-0.5 transition"
            >
              Continue shopping
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const estimatedTax = subtotal * 0.07;
  const total = subtotal + estimatedTax;

  return (
    <PageShell>
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Your Cart</h1>
          <p className="text-slate-600 dark:text-slate-300">{items.length} item(s)</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.7fr,1fr]">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.productId} className="card-surface p-5 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="relative w-28 h-28 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">No image</div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg">{item.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          ${(item.price / 100).toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                        aria-label={`Remove ${item.title}`}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-2 py-1">
                        <button
                          onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          aria-label={`Decrease ${item.title}`}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.productId, Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-16 rounded-lg border border-transparent bg-transparent text-center font-semibold focus:ring-0 focus:border-slate-400"
                          aria-label={`Quantity for ${item.title}`}
                        />
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                          aria-label={`Increase ${item.title}`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="ml-auto text-right space-y-1">
                        <p className="text-sm text-slate-500 dark:text-slate-300">Line subtotal</p>
                        <p className="text-lg font-semibold">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="card-surface p-6 space-y-4 h-fit sticky top-8">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Order Summary</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Review your cart before checkout.</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">${(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Taxes</span>
                <span>${(estimatedTax / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <hr className="border-slate-200 dark:border-slate-800" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
            </div>
            <button
              className="w-full rounded-xl bg-brand px-5 py-3 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
              disabled={items.length === 0}
              onClick={() => {
                if (items.length === 0) return;
                router.push('/checkout');
              }}
            >
              Continue
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add your address next, then complete secure Stripe checkout.</p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
