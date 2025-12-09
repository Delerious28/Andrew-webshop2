import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { ProductImageGallery } from '@/components/ProductImageGallery';
import { AddToCartPanel } from '@/components/cart/AddToCartPanel';

interface Props {
  params: { id: string };
}

export default async function ProductDetail({ params }: Props) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: { orderBy: { order: 'asc' } } } });
  if (!product) return notFound();

  return (
    <div className="grid lg:grid-cols-2 gap-10">
      <Script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" />
      <div className="space-y-4">
        <ProductImageGallery heroImage={product.heroImage} images={product.images} title={product.title} />
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/70 dark:bg-slate-900/70">
          <p className="text-sm text-slate-500">Immersive 3D previews and high-res stills so you can scrutinize every detail.</p>
        </div>
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand/10 text-brand px-4 py-1 text-sm font-semibold">{product.category}</span>
          <h1 className="text-4xl font-bold">{product.title}</h1>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{product.description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/80 dark:bg-slate-900/60">
            <p className="text-sm text-slate-500">Stock</p>
            <p className="text-lg font-semibold">{product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white/80 dark:bg-slate-900/60">
            <p className="text-sm text-slate-500">Price</p>
            <p className="text-2xl font-bold">${(product.price / 100).toFixed(2)}</p>
          </div>
        </div>
        <AddToCartPanel product={{
          id: product.id,
          title: product.title,
          price: product.price,
          heroImage: product.heroImage,
          category: product.category
        }} />
      </div>
    </div>
  );
}
