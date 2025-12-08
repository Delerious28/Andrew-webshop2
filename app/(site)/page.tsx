'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ProductCard } from '@/components/ProductCard';
import { AuthModal } from '@/components/AuthModal';
import { ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { data: session } = useSession();
  const [featured, setFeatured] = useState<any>(null);
  const [latest, setLatest] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      const res = await fetch('/api/products');
      const products = await res.json();
      if (products.length > 0) {
        setFeatured(products[0]);
        setLatest(products.slice(1, 4));
      }
    }
    loadProducts();
  }, []);

  return (
    <>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="signup" />
      <div className="space-y-12">
        <section className="grid md:grid-cols-2 gap-10">
          <div className="flex flex-col space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Precision bicycle parts built for speed and endurance.</h1>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand/30 text-brand bg-brand/10 text-sm font-semibold">
              Remoof · Modern cycling hardware
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-xl">
              Remoof delivers carbon-grade components, verified payments, and immersive 3D previews to remove doubt before you ride.
            </p>
            <div className="flex gap-4">
              <Link href="/products" className="px-4 py-2 bg-brand text-white rounded-full shadow">Browse products</Link>
              {!session && (
                <button onClick={() => setShowAuthModal(true)} className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-full hover:-translate-y-0.5 transition">Create account</button>
              )}
            </div>
            <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Worldwide delivery</span>
              <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> 2-year guarantee</span>
            </div>
          </div>
          <div className="glass-card p-8 space-y-6">
            <p className="text-sm text-slate-500">Featured</p>
            {featured && <ProductCard product={featured} />}
            <Link href="/products" className="flex items-center gap-2 text-brand font-semibold">All products <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Latest Items</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
