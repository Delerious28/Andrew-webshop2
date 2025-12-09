'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type NotificationTone = 'success' | 'info' | 'warning';

export type NotificationPayload = {
  title?: string;
  message: string;
  tone?: NotificationTone;
  durationMs?: number;
};

interface Notification extends NotificationPayload {
  id: string;
  createdAt: number;
}

interface NotificationContextValue {
  notify: (payload: NotificationPayload) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

const toneStyles: Record<NotificationTone, { icon: ReactNode; ring: string; pill: string; chip: string }> = {
  success: {
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
    ring: 'ring-emerald-500/40',
    pill: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-200',
    chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-200'
  },
  info: {
    icon: <Info className="h-5 w-5 text-sky-500" />,
    ring: 'ring-sky-500/40',
    pill: 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-200',
    chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-200'
  },
  warning: {
    icon: <TriangleAlert className="h-5 w-5 text-amber-500" />,
    ring: 'ring-amber-500/40',
    pill: 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-100',
    chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-100'
  }
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notification[]>([]);

  const notify = useCallback((payload: NotificationPayload) => {
    const tone = payload.tone ?? 'info';
    const newItem: Notification = {
      ...payload,
      tone,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
      durationMs: payload.durationMs ?? 4000
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  useEffect(() => {
    if (!items.length) return;
    const timers = items.map((item) =>
      setTimeout(() => setItems((prev) => prev.filter((n) => n.id !== item.id)), item.durationMs)
    );
    return () => timers.forEach(clearTimeout);
  }, [items]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
        <AnimatePresence initial={false}>
          {items.map((item) => {
            const tone = toneStyles[item.tone ?? 'info'];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.94 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                className={`overflow-hidden rounded-2xl border border-white/70 dark:border-slate-800/70 bg-white/90 dark:bg-slate-950/90 backdrop-blur shadow-xl ring-2 ${tone.ring}`}
              >
                <div className="flex items-start gap-3 p-4">
                  <span className="mt-0.5">{tone.icon}</span>
                  <div className="flex-1 space-y-1">
                    {item.title && <p className="text-sm font-semibold leading-tight">{item.title}</p>}
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.message}</p>
                    <div className={`inline-flex items-center gap-2 text-xs px-2 py-1 rounded-full ${tone.chip}`}>
                      <span>Realtime update</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
