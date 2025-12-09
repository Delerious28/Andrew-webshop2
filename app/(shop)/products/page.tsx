import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { motion } from 'framer-motion';

export default async function ProductsPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-2"
      >
        <p className="text-sm text-brand font-semibold">Curated by Remoof</p>
        <h1 className="text-3xl font-bold">Shop components</h1>
        <p className="text-slate-600 dark:text-slate-300">Precision parts with immersive previews and Stripe-ready checkout.</p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </motion.div>
    </div>
  );
}
