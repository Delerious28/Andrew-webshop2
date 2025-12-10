'use client';

import { useState } from 'react';
import { ChevronDown, Link2 } from 'lucide-react';

const faqs = [
  { question: 'How fast do you ship?', answer: 'Most orders leave the warehouse in 1–2 business days with tracking updates sent to your inbox.', category: 'Shipping', anchor: 'shipping' },
  { question: 'Do you support returns?', answer: 'Unused items can be returned within 30 days. Initiate a request from your profile or contact support.', category: 'Returns', anchor: 'returns' },
  { question: 'Can I edit my order after placing it?', answer: 'Yes—contact support within 12 hours and we will adjust items or addresses before fulfillment.', category: 'Orders', anchor: 'orders' },
  { question: 'Do you install parts?', answer: 'We partner with trusted local mechanics. Add a note at checkout and we will coordinate installation.', category: 'Installation', anchor: 'installation' }
];

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(faqs[0].question);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="chip">Answers</p>
        <h1 className="text-3xl font-bold">Frequently asked questions</h1>
        <p className="text-slate-600 dark:text-slate-300">Quick answers about shipping, returns, and order updates.</p>
      </header>
      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
        {['All', ...new Set(faqs.map((f) => f.category))].map((cat) => (
          <span key={cat} className="chip bg-slate-100 dark:bg-slate-900/60">{cat}</span>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {faqs.map((faq) => {
          const isOpen = open === faq.question;
          return (
            <div
              key={faq.question}
              id={faq.anchor}
              className="card-surface p-5 space-y-2 cursor-pointer transition hover:-translate-y-1 hover:shadow-lg"
              onClick={() => setOpen(isOpen ? null : faq.question)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold flex items-center gap-2">
                    {faq.question}
                    <span className="chip text-[10px] uppercase tracking-wide">{faq.category}</span>
                  </p>
                  <a
                    href={`#${faq.anchor}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-brand inline-flex items-center gap-1"
                  >
                    <Link2 className="h-3 w-3" /> Copy link
                  </a>
                </div>
                <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180 text-brand' : 'text-slate-400'}`} />
              </div>
              <div className={`grid transition-all duration-200 ease-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <p className="text-sm text-slate-600 dark:text-slate-300 pt-2">{faq.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
