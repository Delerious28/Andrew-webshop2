'use client';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './cart/CartProvider';
import { useSession } from 'next-auth/react';

interface AddToCartFormProps {
  productId: string;
  stock?: number;
  title?: string;
  price?: number;
  image?: string;
  category?: string;
}

export function AddToCartForm({ productId, stock, title, price, image, category }: AddToCartFormProps) {
  const { status } = useSession();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (stock && quantity > stock) {
      setLoading(false);
      setMessage(`Only ${stock} in stock. Please reduce quantity.`);
      return;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          quantity: parseInt(quantity.toString())
        })
      });

      if (res.ok) {
        if (status === 'authenticated' && title && typeof price === 'number') {
          addItem({ productId, title, price, quantity, image, category });
        }
        setMessage('Added to cart!');
        setQuantity(1);
        setJustAdded(true);
        setTimeout(() => {
          setMessage('');
          setJustAdded(false);
        }, 900);
      } else {
        setMessage('Failed to add to cart');
      }
    } catch (error) {
      setMessage('Error adding to cart');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddToCart} className="flex flex-col items-start gap-3 w-full">
      <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">Qty</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 focus:ring-2 focus:ring-brand/60"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-60"
        >
          <ShoppingCart className="h-4 w-4" />
          {justAdded ? 'Added ✓' : loading ? 'Adding...' : 'Add to cart'}
        </button>
      </div>
      {stock && stock < 5 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">Order soon — low stock.</p>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-300 flex items-center gap-2">
        <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" /> Secure Stripe checkout
      </p>
      {message && (
        <p className={`text-sm ${message.includes('Added') ? 'text-emerald-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
