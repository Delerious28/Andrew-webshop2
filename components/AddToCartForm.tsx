'use client';
import { useState } from 'react';

interface AddToCartFormProps {
  productId: string;
}

export function AddToCartForm({ productId }: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

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
        setMessage('Added to cart!');
        setQuantity(1);
        setTimeout(() => setMessage(''), 3000);
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
    <form onSubmit={handleAddToCart} className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
          className="w-24 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-brand text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Adding...' : 'Add to cart'}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${message.includes('Added') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  );
}
