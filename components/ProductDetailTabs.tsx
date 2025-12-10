'use client';

import { useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface Section {
  id: string;
  label: string;
  content: ReactNode;
}

interface ProductDetailTabsProps {
  sections: Section[];
  defaultTabId?: string;
}

export function ProductDetailTabs({ sections, defaultTabId }: ProductDetailTabsProps) {
  const [active, setActive] = useState(defaultTabId || sections[0]?.id);
  const current = sections.find((section) => section.id === active) || sections[0];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActive(section.id)}
            className={`chip text-sm ${
              active === section.id ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20' : 'hover:border-brand/50'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-5 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={current?.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-2"
          >
            {current?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
