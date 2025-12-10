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
      <main className="mx-auto max-w-4xl px-4 py-16 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">Your Cart</h1>
          <p className="text-slate-600 dark:text-slate-300">Your cart is empty.</p>
        </div>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-white shadow hover:opacity-90"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold">Your Cart</h1>
        <p className="text-slate-600 dark:text-slate-300">{cartItems.length} item(s)</p>
      </div>

      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex gap-4 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
            <div className="relative w-24 h-24 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800 flex-shrink-0">
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

            <div className="flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-semibold text-lg">{item.product.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  ${(item.product.price / 100).toFixed(2)} each
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <p className="font-semibold text-lg">
                  ${((item.product.price * item.quantity) / 100).toFixed(2)}
                </p>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="ml-auto p-2 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
        <div className="flex justify-between items-center text-lg font-semibold">
          <span>Total:</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>

        <button
          onClick={handleCheckout}
          disabled={checkoutLoading}
          className="w-full bg-brand text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {checkoutLoading ? 'Redirecting to Stripe...' : 'Checkout with Stripe'}
        </button>

        <Link
          href="/products"
          className="block text-center text-brand hover:underline"
        >
          Continue shopping
        </Link>
      </div>
    </main>
  );
}

