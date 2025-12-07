import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { ProductCard } from '@/components/ProductCard';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';

export default async function HomePage() {
  const products = await prisma.product.findMany({ take: 3 });
  return (
    <div className="space-y-12">
      <section className="grid md:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/30 text-brand bg-brand/10 text-sm font-semibold">
            Remoof · Modern cycling hardware
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">Precision bicycle parts built for speed and endurance.</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl">
            Remoof delivers carbon-grade components, verified payments, and immersive 3D previews to remove doubt before you ride.
          </p>
          <div className="flex gap-4">
            <Link href="/products" className="px-4 py-2 bg-brand text-white rounded-full shadow">Browse products</Link>
            <Link href="/signup" className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-full hover:-translate-y-0.5 transition">Create account</Link>
          </div>
          <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Worldwide delivery</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> 2-year guarantee</span>
          </div>
        </div>
        <div className="glass-card p-8 space-y-6">
          <p className="text-sm text-slate-500">Featured</p>
          <div className="grid gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <Link href="/products" className="flex items-center gap-2 text-brand font-semibold">All products <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
