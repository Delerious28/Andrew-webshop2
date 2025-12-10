'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Trash2, Plus, Minus } from 'lucide-react';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    price: number;
    images: { url: string; type: string }[];
  };
}

export default function CartPage() {
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetchCart();
    }
  }, [session]);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart');
      if (res.ok) {
        const items = await res.json();
        setCartItems(items);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });
      if (res.ok) {
        setCartItems(prev => prev.filter(item => item.product.id !== productId));
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    try {
      const currentItem = cartItems.find(item => item.product.id === productId);
      if (!currentItem) return;

      const quantityDiff = newQuantity - currentItem.quantity;
      
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: quantityDiff })
      });

      if (res.ok) {
        setCartItems(prev =>
          prev.map(item =>
            item.product.id === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST'
      });

      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        alert('Failed to start checkout');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error during checkout');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (!session) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Your Cart</h1>
          <p className="text-slate-600 dark:text-slate-300">Please sign in to view your cart.</p>
        </div>
        <Link href="/signin" className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-white shadow hover:opacity-90">
          Sign In
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-slate-600 dark:text-slate-300">Loading cart...</p>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-16 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Your Cart</h1>
          <p className="text-slate-600 dark:text-slate-300">Your cart is empty.</p>
        </div>
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
      </main>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <main className="mx-auto max-w-6xl px-6 py-16 space-y-10">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">Your Cart</h1>
        <p className="text-slate-600 dark:text-slate-300">{cartItems.length} item(s)</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.7fr,1fr]">
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="card-surface p-5 flex flex-col gap-4">
              <div className="flex gap-4">
                <div className="relative w-28 h-28 overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                  {item.product.images?.[0] ? (
                    <Image
                      src={item.product.images[0].url}
                      alt={item.product.title}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-500">No image</div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{item.product.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300">${(item.product.price / 100).toFixed(2)} each</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-2 py-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                        className="w-14 text-center bg-transparent focus:outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-300">Move to wishlist</p>
                    <p className="ml-auto text-lg font-semibold">${((item.product.price * item.quantity) / 100).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="card-surface p-6 space-y-4 h-fit">
          <div>
            <h2 className="text-xl font-semibold">Order Summary</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">Review totals before checkout</p>
          </div>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-200">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${(total / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes</span>
              <span>Calculated at checkout</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Free over $99</span>
            </div>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t border-slate-200 dark:border-slate-800">
            <span>Total</span>
            <span>${(total / 100).toFixed(2)}</span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="w-full bg-brand text-white py-3 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {checkoutLoading ? 'Redirecting to Stripe...' : 'Checkout with Stripe'}
          </button>
          <Link href="/products" className="block text-center text-brand hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    </main>
  );
}

