import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800/60 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between text-sm text-slate-500 dark:text-slate-400">
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">Remoof</p>
          <p>Precision bicycle parts for riders who demand more.</p>
        </div>
        <div className="flex gap-4">
          <Link href="/legal/terms">Terms</Link>
          <Link href="/legal/privacy">Privacy</Link>
          <Link href="/legal/refund">Refunds</Link>
        </div>
      </div>
    </footer>
  );
}
