'use client';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { ProductCard } from '@/components/ProductCard';
import { AuthModal } from '@/components/AuthModal';
import { ArrowRight, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageShell } from '@/components/PageShell';
import { useCart } from '@/components/cart/CartProvider';

export default function HomePage() {
  const { data: session } = useSession();
  const [featured, setFeatured] = useState<any>(null);
  const [latest, setLatest] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [addingFeatured, setAddingFeatured] = useState(false);
  const { addItem } = useCart();

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
      <PageShell>
        <div className="space-y-16">
        <section className="grid md:grid-cols-2 gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col space-y-6 max-w-xl h-fit"
          >
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Precision bicycle parts built for speed and endurance.
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-200 max-w-2xl">
              Remoof delivers carbon-grade components, trusted checkout, and hands-on setup guidance to remove doubt before you ride.
            </p>
            <ul className="grid sm:grid-cols-3 gap-3 text-sm text-slate-600 dark:text-slate-200">
              {["Carbon-grade components", "Secure checkout", "Setup support from gear experts"].map((item) => (
                <li key={item} className="flex items-start gap-2 rounded-2xl border border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-900/70 p-3 shadow-sm">
                  <span className="mt-0.5 h-2 w-2 rounded-full bg-brand" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="px-5 py-3 bg-brand text-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition"
              >
                Browse products
              </Link>
              {!session && (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-5 py-3 border border-slate-200 dark:border-slate-800 rounded-xl hover:-translate-y-0.5 transition bg-white/70 dark:bg-slate-900/70"
                >
                  Create account
                </button>
              )}
            </div>
            <Link href="/products" className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
              View all wheels
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="grid grid-cols-2 gap-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3 bg-white/70 dark:bg-slate-900/70">
                <Truck className="h-4 w-4 text-brand" />
                <span>Worldwide delivery with live tracking</span>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3 flex items-center gap-3 bg-white/70 dark:bg-slate-900/70">
                <ShieldCheck className="h-4 w-4 text-brand" />
                <span>2-year guarantee & secure Stripe checkout</span>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="card-surface p-6 space-y-4"
          >
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-300 tracking-wide uppercase">
              Featured upgrade · Perfect for endurance builds
            </p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Featured product</p>
              <span className="chip bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-200/60 dark:border-emerald-700/50">New drop</span>
            </div>
            {featured && (
              <div className="space-y-4">
                <ProductCard product={featured} accent showNewBadge specLine="140mm PWM fan · RGB ring" />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      if (!session) {
                        setShowAuthModal(true);
                        return;
                      }
                    if (addingFeatured) return;
                    setAddingFeatured(true);
                    addItem({
                      productId: featured.id,
                      title: featured.title,
                      price: featured.price,
                      quantity: 1,
                      image: featured.images?.[0]?.url,
                      category: featured.category
                    });
                    setTimeout(() => setAddingFeatured(false), 350);
                    }}
                    className="px-4 py-2 bg-brand text-white rounded-xl font-semibold shadow hover:-translate-y-0.5 transition disabled:opacity-70"
                    disabled={addingFeatured}
                  >
                    {addingFeatured ? 'Adding…' : 'Add to cart'}
                  </button>
                  <Link href="/products" className="flex items-center gap-2 text-brand font-semibold">
                    All products <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </section>
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">Latest Items</h2>
            <div className="flex gap-2 text-xs text-slate-500">
              <span className="chip">Low-friction checkout</span>
              <span className="chip">Fast dispatch</span>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {latest.map((product) => (
              <ProductCard key={product.id} product={product} accent showNewBadge />
            ))}
          </div>
        </section>
        </div>
      </PageShell>
    </>
  );
}
