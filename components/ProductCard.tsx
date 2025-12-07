import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart } from 'lucide-react';

export function ProductCard({ product }: { product: any }) {
  return (
    <Link href={`/products/${product.id}`} className="glass-card p-4 flex flex-col gap-3 hover:-translate-y-1 transition">
      <div className="relative w-full h-52 overflow-hidden rounded-xl">
        <Image src={product.heroImage} alt={product.title} fill className="object-cover" />
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-lg">{product.title}</p>
          <span className="text-sm text-brand">{product.category}</span>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{product.description}</p>
      </div>
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold">${(product.price / 100).toFixed(2)}</p>
        <span className="flex items-center gap-1 text-brand text-sm"><ShoppingCart className="h-4 w-4" />View</span>
      </div>
    </Link>
  );
}
