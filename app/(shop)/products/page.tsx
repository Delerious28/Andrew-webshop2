import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shop components</h1>
          <p className="text-slate-600 dark:text-slate-300">Precision parts curated by Remoof.</p>
        </div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
