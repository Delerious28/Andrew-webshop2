import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { AddToCartForm } from '@/components/AddToCartForm';

interface Props {
  params: { id: string };
}

export default async function ProductDetail({ params }: Props) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: { orderBy: { order: 'asc' } } } });
  if (!product) return notFound();

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <Script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" />
      <div className="space-y-4">
        <ProductImageGallery images={product.images} title={product.title} />
      </div>
      <div className="space-y-7">
        <div className="space-y-3">
          <p className="chip bg-brand/10 text-brand border-brand/40 w-fit">{product.category}</p>
          <h1 className="text-4xl font-extrabold leading-tight">{product.title}</h1>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">${(product.price / 100).toFixed(2)}</p>
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
            <span className={`chip ${product.stock > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200/60' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-200 border-red-200/60'}`}>
              {product.stock > 0 ? `In stock · ${product.stock} available` : 'Out of stock'}
            </span>
            <span className="chip">Ships in 1–2 business days</span>
            <span className="chip">Free shipping over $99</span>
          </div>
          <p className="text-base text-slate-600 dark:text-slate-200">{product.description}</p>
          <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-200">
            {['Carbon-grade hardware', 'Precision machining', 'Tested for endurance'].map((spec) => (
              <li key={spec} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-brand" />
                <span>{spec}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-surface p-5 space-y-3">
          <h3 className="text-lg font-semibold">Add to cart</h3>
          <AddToCartForm productId={product.id} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/60 dark:bg-slate-900/60">
            <p className="font-semibold">You may also like</p>
            <p className="text-sm text-slate-500 dark:text-slate-300">Cross-sell suggestions coming soon.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/60 dark:bg-slate-900/60">
            <p className="font-semibold">Specifications</p>
            <p className="text-sm text-slate-500 dark:text-slate-300">Material, weight, and fit details will live here.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/60 dark:bg-slate-900/60">
            <p className="font-semibold">Reviews</p>
            <p className="text-sm text-slate-500 dark:text-slate-300">Be the first to review this component.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
