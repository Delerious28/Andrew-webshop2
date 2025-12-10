import { prisma } from '@/lib/prisma';
import { ProductsExplorer } from '@/components/ProductsExplorer';
import { ProductsPageClient } from '@/components/ProductsPageClient';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });
  return (
    <ProductsPageClient products={products} />
  );
}
