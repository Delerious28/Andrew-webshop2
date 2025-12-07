'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, User2 } from 'lucide-react';

interface ProfileMenuProps {
  name?: string | null;
}

export function ProfileMenu({ name }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full border border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
      >
        <User2 className="h-5 w-5" />
        <span className="hidden sm:inline text-sm font-medium">{name || 'Profile'}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute right-0 mt-2 w-48 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
          >
            <Link
              href="/profile"
              className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              onClick={() => setOpen(false)}
            >
              <User2 className="h-4 w-4" /> Show profile
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full flex items-center gap-2 px-4 py-3 text-left text-sm hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 transition"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
