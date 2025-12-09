'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem, useCart } from './CartProvider';

interface Props {
  item: CartItem;
}

export function CartItemRow({ item }: Props) {
  const { updateQuantity, removeItem } = useCart();

  const adjust = (delta: number) => {
    const next = Math.max(1, item.quantity + delta);
    updateQuantity(item.productId, next);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/70 p-4 shadow"
    >
      <div className="flex gap-4">
        <div className="relative h-24 w-24 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          {item.image ? (
            <Image src={item.image} alt={item.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-400 text-sm">No image</div>
          )}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg leading-tight">{item.title}</p>
              {item.category && (
                <span className="text-xs px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.category}
                </span>
              )}
            </div>
            <p className="text-lg font-semibold">${((item.price * item.quantity) / 100).toFixed(2)}</p>
          </div>
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 px-2 py-1 bg-slate-50 dark:bg-slate-900/60">
              <button
                onClick={() => adjust(-1)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => adjust(1)}
                className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button
              onClick={() => removeItem(item.productId)}
              className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700 dark:text-red-400"
            >
              <Trash2 className="h-4 w-4" /> Remove
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
