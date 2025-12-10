'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { PageShell } from '@/components/PageShell';
import { useCart } from '@/components/cart/CartProvider';

const requiredFields = ['fullName', 'email', 'line1', 'city', 'state', 'postal', 'country'] as const;

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal: string;
  country: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, ready, subtotal } = useCart();
  const [form, setForm] = useState<FormState>({
    fullName: '',
    email: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal: '',
    country: ''
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/signin?callbackUrl=/checkout');
    }
  }, [router, status]);

  useEffect(() => {
    const preload = async () => {
      if (!session?.user) return;
      const baseName = [
        (session.user as any).firstName,
        (session.user as any).lastName,
        session.user.name
      ]
        .filter(Boolean)
        .join(' ');

      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || baseName,
        email: prev.email || (session.user?.email ?? ''),
      }));

      try {
        const res = await fetch('/api/address');
        if (!res.ok) return;
        const [address] = await res.json();
        if (address) {
          setForm((prev) => ({
            ...prev,
            line1: address.line1 ?? '',
            line2: address.line2 ?? '',
            city: address.city ?? '',
            state: address.state ?? '',
            postal: address.postal ?? '',
            country: address.country ?? ''
          }));
        }
      } catch (error) {
        console.warn('Failed to preload address', error);
      }
    };

    if (status === 'authenticated') {
      preload();
    }
  }, [session?.user, status]);

  const total = useMemo(() => subtotal + subtotal * 0.07, [subtotal]);

  if (status === 'loading' || !ready) {
    return (
      <PageShell>
        <p className="text-slate-600 dark:text-slate-300">Loading checkout…</p>
      </PageShell>
    );
  }

  if (!session) {
    return null;
  }

  if (items.length === 0) {
    return (
      <PageShell>
        <div className="space-y-6 max-w-2xl">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <p className="text-slate-600 dark:text-slate-300">Add items to your cart before continuing to payment.</p>
          <div className="card-surface p-8 space-y-4 text-center">
            <p className="text-lg font-semibold">Your bag is empty</p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-3 text-white font-semibold shadow hover:-translate-y-0.5 transition"
            >
              Browse products
            </Link>
          </div>
        </div>
      </PageShell>
    );
  }

  const validate = () => {
    const nextErrors: FieldErrors = {};
    requiredFields.forEach((key) => {
      if (!form[key].trim()) {
        nextErrors[key] = 'Required';
      }
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = 'Enter a valid email';
    }
    return nextErrors;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    setErrors({});
    setFormError('');
    setLoading(true);

    try {
      await fetch('/api/address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          postal: form.postal,
          country: form.country
        })
      });

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Unable to start checkout');
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url as string;
      }
    } catch (error: any) {
      setFormError(error.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="space-y-8">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-300">Checkout</p>
          <h1 className="text-4xl font-bold">Shipping details</h1>
          <p className="text-slate-600 dark:text-slate-300">Confirm where we should ship your order before secure payment.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] items-start">
          <form onSubmit={handleSubmit} className="card-surface p-6 md:p-8 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Full name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand"
                  required
                />
                {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand"
                  required
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Phone (optional)</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand"
                />
              </div>
              <div />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold">Street address</label>
              <input
                value={form.line1}
                onChange={(e) => setForm((prev) => ({ ...prev, line1: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand"
                required
              />
              {errors.line1 && <p className="text-xs text-red-500">{errors.line1}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold">Apartment, suite, etc. (optional)</label>
              <input
                value={form.line2}
                onChange={(e) => setForm((prev) => ({ ...prev, line2: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand"
                  required
                />
                {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">State / Region</label>
                <input
                  value={form.state}
                  onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand"
                  required
                />
                {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Postal code</label>
                <input
                  value={form.postal}
                  onChange={(e) => setForm((prev) => ({ ...prev, postal: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand"
                  required
                />
                {errors.postal && <p className="text-xs text-red-500">{errors.postal}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold">Country</label>
                <input
                  value={form.country}
                  onChange={(e) => setForm((prev) => ({ ...prev, country: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:border-brand focus:ring-1 focus:ring-brand"
                  required
                />
                {errors.country && <p className="text-xs text-red-500">{errors.country}</p>}
              </div>
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-brand px-5 py-3 text-white font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
              >
                {loading ? 'Redirecting to payment…' : 'Continue to payment'}
              </button>
              <p className="text-xs text-slate-500 dark:text-slate-400">Secure Stripe checkout follows after this step.</p>
            </div>
          </form>

          <aside className="card-surface p-6 space-y-4 h-fit sticky top-8">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold">Order summary</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">Review items before payment.</p>
            </div>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900">
                    {item.image ? (
                      <Image src={item.image} alt={item.title} fill className="object-contain" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">No image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold leading-tight">{item.title}</p>
                    <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                  </div>
                  <p className="font-semibold">${((item.price * item.quantity) / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold">${(subtotal / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Estimated tax</span>
                <span>${(subtotal * 0.07 / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Shipping</span>
                <span>Calculated at Stripe</span>
              </div>
              <hr className="border-slate-200 dark:border-slate-800" />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(total / 100).toFixed(2)}</span>
              </div>
            </div>
            <Link href="/cart" className="text-sm text-brand font-semibold hover:underline">
              Back to cart
            </Link>
          </aside>
        </div>
      </div>
    </PageShell>
  );
}
