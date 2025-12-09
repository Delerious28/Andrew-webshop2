"use client";
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MouseEvent } from 'react';
import { useCart } from './cart/CartProvider';

interface ProductCardProps {
  product: any;
  accent?: boolean;
}

export function ProductCard({ product, accent = false }: ProductCardProps) {
  const { addItem } = useCart();

  const handleQuickAdd = (e: MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      quantity: 1,
      image: product.heroImage,
      category: product.category
    });
  };

  return (
    <Link href={`/products/${product.id}`}>
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        className={`glass-card p-4 flex flex-col gap-3 transition ${accent ? 'border-2 border-brand/30 shadow-brand/20' : ''}`}
      >
        <div className="relative w-full h-52 overflow-hidden rounded-xl">
          <Image src={product.heroImage} alt={product.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute left-3 bottom-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5 text-brand" />
            <span>{product.category}</span>
          </div>
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-lg">{product.title}</p>
            <span className="text-sm text-brand">${(product.price / 100).toFixed(2)}</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{product.description}</p>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1 text-brand text-sm font-semibold"><ShoppingCart className="h-4 w-4" />View detail</span>
          <button
            onClick={handleQuickAdd}
            className="text-xs px-3 py-1.5 rounded-full bg-brand text-white shadow hover:shadow-lg transition"
          >
            Quick add
          </button>
        </div>
      </motion.div>
    </Link>
  );
}
