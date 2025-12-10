import '@/styles/globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ReactNode } from 'react';
import { Providers } from './providers';
import { SplashScreen } from '@/components/SplashScreen';

export const metadata = {
  title: 'Remoof | Modern Bicycle Parts',
  description: 'Premium ecommerce for precision bicycle components.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen grid-ambient">
        <Providers>
          <SplashScreen />
          <Navbar />
          <main className="mx-auto max-w-7xl px-6 py-12 space-y-10">
            <div className="relative overflow-hidden rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/50 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)]">
              <div className="absolute inset-0 bg-gradient-to-br from-brand/10 via-transparent to-emerald-200/10 dark:from-brand/5 dark:to-emerald-500/5" />
              <div className="relative">{children}</div>
            </div>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
