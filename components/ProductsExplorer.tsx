'use client';

import { useMemo, useState, useTransition } from 'react';
import { ProductCard } from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductsExplorerProps {
  products: any[];
}

const categories = ['All', 'Wheels', 'Brakes', 'Drivetrain', 'Cooling', 'Components'];
const sorters: Record<string, (a: any, b: any) => number> = {
  'price-asc': (a, b) => a.price - b.price,
  newest: (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  popular: (a, b) => b.stock - a.stock
};

export function ProductsExplorer({ products }: ProductsExplorerProps) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    const base = activeCategory === 'All'
      ? products
      : products.filter((p) => p.category?.toLowerCase().includes(activeCategory.toLowerCase()));
    const sorter = sorters[sort];
    return sorter ? [...base].sort(sorter) : base;
  }, [activeCategory, products, sort]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/60 p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => startTransition(() => setActiveCategory(cat))}
              className={`chip ${activeCategory === cat ? 'bg-brand text-white border-brand' : 'hover:border-brand/50'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
          <label className="font-semibold">Sort</label>
          <select
            value={sort}
            onChange={(e) => startTransition(() => setSort(e.target.value))}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 px-3 py-2 focus:ring-2 focus:ring-brand/60"
          >
            <option value="price-asc">Price: Low → High</option>
            <option value="newest">Newest</option>
            <option value="popular">Popular</option>
          </select>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${sort}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className={`grid gap-6 sm:grid-cols-2 lg:grid-cols-3 ${isPending ? 'opacity-70' : ''}`}
        >
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
