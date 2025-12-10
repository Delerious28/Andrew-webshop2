import { prisma } from '@/lib/prisma';
import { ProductsPageClient } from '@/components/ProductsPageClient';
import { PageShell } from '@/components/PageShell';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: 'LIVE' },
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });
  return (
    <PageShell>
      <ProductsPageClient products={products} />
    </PageShell>
  );
}
