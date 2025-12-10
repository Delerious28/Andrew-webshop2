import { prisma } from '@/lib/prisma';
import { motion } from 'framer-motion';
import { ProductsExplorer } from '@/components/ProductsExplorer';
import { PageShell } from '@/components/PageShell';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { images: true }
  });
  return (
    <PageShell>
      <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 max-w-3xl"
      >
        <p className="text-sm text-brand font-semibold">Curated by Remoof</p>
        <h1 className="text-4xl font-extrabold leading-tight">Shop components</h1>
        <p className="text-base text-slate-500 dark:text-slate-200">Precision parts with immersive previews and seamless checkout.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <ProductsExplorer products={products} />
      </motion.div>
      </div>
    </PageShell>
  );
}
