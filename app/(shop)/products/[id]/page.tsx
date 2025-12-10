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
    <div className="grid lg:grid-cols-2 gap-10">
      <Script type="module" src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js" />
      <div className="space-y-4">
        <ProductImageGallery images={product.images} title={product.title} />
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
        <AddToCartForm productId={product.id} />
      </div>
    </div>
  );
}
