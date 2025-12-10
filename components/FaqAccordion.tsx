'use client';
import { useMemo, useState } from 'react';
import { ChevronDown, Link2 } from 'lucide-react';

export type FaqBlock = { type: 'text' | 'image' | 'link'; content?: string; imageUrl?: string; alt?: string; label?: string; url?: string };
export type FaqItem = { id: string; title: string; blocks: FaqBlock[]; anchor: string };

export function FaqAccordion({ faqs }: { faqs: FaqItem[] }) {
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id ?? null);
  const categories = useMemo(() => ['All', 'Shipping', 'Returns', 'Orders', 'Installation'], []);

  const renderBlock = (block: FaqBlock, idx: number) => {
    if (block.type === 'image') {
      return (
        <div key={idx} className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50">
          <img src={block.imageUrl} alt={block.alt || 'FAQ media'} className="w-full object-cover" />
          {block.alt && <p className="text-xs text-slate-500 dark:text-slate-400 px-3 py-2">{block.alt}</p>}
        </div>
      );
    }
    if (block.type === 'link') {
      return (
        <a
          key={idx}
          href={block.url}
          className="inline-flex items-center gap-2 text-brand hover:text-brand/80 underline"
          target="_blank"
          rel="noreferrer"
        >
          <Link2 className="h-3.5 w-3.5" /> {block.label || block.url}
        </a>
      );
    }
    return (
      <p key={idx} className="text-sm text-slate-600 dark:text-slate-200 leading-relaxed">
        {block.content}
      </p>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-300">
        {categories.map((cat) => (
          <span key={cat} className="chip bg-slate-100 dark:bg-slate-900/60">{cat}</span>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id;
          return (
            <div
              key={faq.id}
              id={faq.anchor}
              className={`card-surface p-5 space-y-3 cursor-pointer transition duration-200 hover:-translate-y-1 hover:shadow-xl ${
                isOpen ? 'ring-2 ring-brand/40' : ''
              }`}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-semibold flex items-center gap-2">
                    {faq.title}
                    <span className="chip text-[10px] uppercase tracking-wide">FAQ</span>
                  </p>
                  <a
                    href={`#${faq.anchor}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-brand inline-flex items-center gap-1 hover:underline"
                  >
                    <Link2 className="h-3 w-3" /> Copy link
                  </a>
                </div>
                <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180 text-brand' : 'text-slate-400'}`} />
              </div>
              <div
                className={`grid transition-all duration-200 ease-out ${
                  isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                }`}
              >
                <div className="overflow-hidden space-y-3 pt-2">
                  {faq.blocks.map((block, idx) => renderBlock(block as FaqBlock, idx))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
