import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, CircleDot, ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: any;
  accent?: boolean;
  showNewBadge?: boolean;
  specLine?: string;
}

export function ProductCard({ product, accent, showNewBadge, specLine }: ProductCardProps) {
  const firstImage = product.images?.[0]?.url;
  const createdRecently = showNewBadge && product.createdAt && new Date().getTime() - new Date(product.createdAt).getTime() < 1000 * 60 * 60 * 24 * 14;
  const stockCopy = product.stock > 10 ? 'In stock' : product.stock > 0 ? 'Low stock' : 'Out of stock';

  return (
    <Link
      href={`/products/${product.id}`}
      className={`group card-surface p-5 flex flex-col gap-4 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${accent ? 'border-brand/40 shadow-xl' : ''}`}
    >
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={product.title}
            fill
            className="object-contain transition duration-500 group-hover:scale-[1.04] group-hover:-translate-y-1"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">No image</div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="chip text-xs">{product.category}</span>
        {createdRecently && <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200/60">New</span>}
      </div>
      <div className="flex-1 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-semibold text-lg leading-tight text-slate-900 dark:text-white">{product.title}</p>
            <p className="text-sm text-slate-600 dark:text-slate-200 line-clamp-1">{product.description}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-brand" />
        </div>
        {specLine && <p className="text-xs text-slate-500 dark:text-slate-400">{specLine}</p>}
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <CircleDot className={`h-4 w-4 ${product.stock > 0 ? 'text-emerald-500' : 'text-red-500'}`} />
            <span>
              {stockCopy}
              {product.stock > 0 ? ` · ${product.stock} available` : ''}
            </span>
          </div>
          <span className="chip text-xs">{product.category}</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">${(product.price / 100).toFixed(2)}</p>
          <span className="inline-flex items-center gap-2 rounded-xl bg-brand/10 text-brand px-3 py-2 text-sm font-semibold group-hover:bg-brand group-hover:text-white transition">
            <ShoppingCart className="h-4 w-4" /> View
          </span>
        </div>
      </div>
    </Link>
  );
}
