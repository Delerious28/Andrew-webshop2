import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between text-sm text-slate-500 dark:text-slate-400">
        <div className="space-y-1">
          <p className="font-semibold text-slate-800 dark:text-slate-100">Remoof</p>
          <p className="text-slate-600 dark:text-slate-300">Precision bicycle parts for riders who demand more.</p>
          <p className="text-xs text-slate-400">Stripe-powered checkout launching soon.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/legal/terms" className="hover:text-slate-700 dark:hover:text-white">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-slate-700 dark:hover:text-white">Privacy</Link>
          <Link href="/legal/refund" className="hover:text-slate-700 dark:hover:text-white">Refunds</Link>
        </div>
      </div>
    </footer>
  );
}
