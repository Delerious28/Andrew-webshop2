'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { LegalModal } from './LegalModal';

export function Footer() {
  const [legalOpen, setLegalOpen] = useState<false | 'terms' | 'privacy'>(false);

  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col md:flex-row gap-6 md:items-center md:justify-between text-sm text-slate-500 dark:text-slate-400">
        <div className="space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image src="/logo.svg" alt="Remoof" width={120} height={36} className="drop-shadow" />
            <span className="font-semibold text-slate-800 dark:text-slate-100">Precision bicycle parts</span>
          </Link>
          <p className="text-xs text-slate-400">Built for riders who demand more.</p>
        </div>
        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => setLegalOpen('terms')}
            className="inline-flex items-center gap-2 hover:text-slate-700 dark:hover:text-white"
          >
            <CheckCircle className="h-4 w-4 text-brand" /> Terms
          </button>
          <button
            onClick={() => setLegalOpen('privacy')}
            className="inline-flex items-center gap-2 hover:text-slate-700 dark:hover:text-white"
          >
            <CheckCircle className="h-4 w-4 text-brand" /> Privacy
          </button>
          <Link href="/legal/refund" className="hover:text-slate-700 dark:hover:text-white">Refunds</Link>
          <Link href="/settings" className="hover:text-slate-700 dark:hover:text-white">Settings</Link>
        </div>
      </div>
      <LegalModal
        open={Boolean(legalOpen)}
        initialTab={legalOpen === 'privacy' ? 'privacy' : 'terms'}
        onClose={() => setLegalOpen(false)}
      />
    </footer>
  );
}
