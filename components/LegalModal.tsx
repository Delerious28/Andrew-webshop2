'use client';

import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import Link from 'next/link';

const legalContent: Record<'terms' | 'privacy', { title: string; body: string[]; download: string }> = {
  terms: {
    title: 'Terms of Service',
    body: [
      'Orders require verified email accounts. Prices are shown in USD and charged via Stripe.',
      'Remoof supplies components with no guarantee beyond manufacturer specs. Riding bicycles is inherently risky; you assume all responsibility for correct installation and safe operation.',
      'Components include a two-year manufacturing defect warranty. Damage from crashes, misuse, or improper installation is excluded.'
    ],
    download: '/legal/terms.txt'
  },
  privacy: {
    title: 'Privacy Policy',
    body: [
      'Emails are used for verification, password resets, receipts, and shipping updates. You may request data deletion at any time.',
      'We use encryption in transit and restrict staff access to customer data.',
      'For privacy questions contact support@remoof.example.'
    ],
    download: '/legal/privacy.txt'
  }
};

interface LegalModalProps {
  open: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy';
  onAcknowledge?: () => void;
}

export function LegalModal({ open, onClose, initialTab = 'terms', onAcknowledge }: LegalModalProps) {
  const [tab, setTab] = useState<'terms' | 'privacy'>(initialTab);

  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  if (!open) return null;

  const content = legalContent[tab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-brand/10 to-emerald-500/10">
          <div className="flex items-center gap-2 text-sm font-semibold text-brand">
            <span>Policies</span>
            <span className="h-6 w-px bg-slate-300 dark:bg-slate-700" />
            <div className="flex gap-2 rounded-full bg-white/70 dark:bg-slate-800/70 p-1">
              <button
                onClick={() => setTab('terms')}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${tab === 'terms' ? 'bg-brand text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Terms
              </button>
              <button
                onClick={() => setTab('privacy')}
                className={`px-3 py-1 rounded-full text-xs font-semibold ${tab === 'privacy' ? 'bg-brand text-white shadow' : 'text-slate-600 dark:text-slate-300'}`}
              >
                Privacy
              </button>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close legal modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-auto">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{content.title}</h3>
          <div className="space-y-3 text-sm text-slate-600 dark:text-slate-200">
            {content.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a
              href={content.download}
              download
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="h-4 w-4" /> Download {content.title}
            </a>
            <Link
              href={tab === 'terms' ? '/legal/terms' : '/legal/privacy'}
              target="_blank"
              className="text-sm text-brand font-semibold hover:underline"
            >
              Open full page
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">Checking the box in the auth form confirms you agree to these terms.</p>
          {onAcknowledge && (
            <button
              onClick={onAcknowledge}
              className="text-sm font-semibold text-brand px-4 py-2 rounded-lg hover:bg-brand/10"
            >
              Mark as read ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
