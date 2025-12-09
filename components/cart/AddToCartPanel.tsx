'use client';

import { motion } from 'framer-motion';
import { Minus, Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './CartProvider';

interface Props {
  product: {
    id: string;
    title: string;
    price: number;
    heroImage?: string;
    category?: string;
  };
}

export function AddToCartPanel({ product }: Props) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);

  const adjust = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 shadow-xl p-5 space-y-4 backdrop-blur"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Ready to ride</p>
          <p className="text-2xl font-semibold text-slate-900 dark:text-white">${(product.price / 100).toFixed(2)}</p>
        </div>
        <span className="rounded-full px-3 py-1 text-xs font-semibold bg-brand/10 text-brand">{product.category}</span>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/50 px-3 py-2">
        <button
          type="button"
          onClick={() => adjust(-1)}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="font-semibold text-lg">{quantity}</span>
        <button
          type="button"
          onClick={() => adjust(1)}
          className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <motion.button
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={() =>
          addItem({
            productId: product.id,
            title: product.title,
            price: product.price,
            quantity,
            image: product.heroImage,
            category: product.category
          })
        }
        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand text-white font-semibold px-4 py-3 shadow-lg hover:shadow-2xl transition"
      >
        <Sparkles className="h-4 w-4" />
        Add to cart
      </motion.button>
      <p className="text-xs text-slate-500 dark:text-slate-400">Secure checkout with Stripe will be enabled once keys are configured.</p>
    </motion.div>
  );
}
