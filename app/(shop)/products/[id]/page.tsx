import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Script from 'next/script';
import { ProductImageGallery } from '@/components/ProductImageGallery';

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
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-brand text-sm font-semibold">{product.category}</p>
          <h1 className="text-4xl font-bold">{product.title}</h1>
          <p className="text-slate-600 dark:text-slate-300">{product.description}</p>
        </div>
        <div className="space-y-2">
          <p className="text-3xl font-bold">${(product.price / 100).toFixed(2)}</p>
          <p className="text-sm text-slate-500">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
        </div>
        <form action="/api/cart" method="post" className="flex items-center gap-3">
          <input type="hidden" name="productId" value={product.id} />
          <input type="number" name="quantity" min={1} defaultValue={1} className="w-24 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" />
          <button className="px-4 py-2 bg-brand text-white rounded-lg font-semibold">Add to cart</button>
        </form>
      </div>
    </div>
  );
}
