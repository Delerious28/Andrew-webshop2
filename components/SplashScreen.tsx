'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SPLASH_COOKIE = 'remoof_splash_seen_at';
const HOUR_MS = 60 * 60 * 1000;

function readSplashCookie(): number | null {
  if (typeof document === 'undefined') return null;
  const cookie = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${SPLASH_COOKIE}=`));
  if (!cookie) return null;
  const value = Number(cookie.split('=')[1]);
  return Number.isFinite(value) ? value : null;
}

function setSplashCookie() {
  const expires = new Date(Date.now() + HOUR_MS).toUTCString();
  document.cookie = `${SPLASH_COOKIE}=${Date.now()}; expires=${expires}; path=/; SameSite=Lax`;
}

export function SplashScreen() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const lastSeen = readSplashCookie();
    const now = Date.now();
    if (!lastSeen || now - lastSeen > HOUR_MS) {
      setShouldShow(true);
      setSplashCookie();
    }
  }, []);

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div
            role="status"
            aria-label="Loading Remoof"
            className="relative w-[320px] h-[320px] rounded-full border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-black shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.35),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.4),transparent_40%),radial-gradient(circle_at_50%_80%,rgba(14,165,233,0.35),transparent_35%)]" />
            <div className="absolute inset-8 rounded-full border border-white/5" />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            >
              <div className="h-48 w-48 rounded-full border border-white/10" />
              <div className="absolute -top-4 right-[25%] h-4 w-4 rounded-full bg-brand shadow-[0_0_24px_rgba(56,189,248,0.8)]" />
              <div className="absolute -bottom-4 left-[18%] h-3 w-3 rounded-full bg-white/80 shadow-[0_0_18px_rgba(255,255,255,0.65)]" />
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ rotate: -360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            >
              <div className="h-60 w-60 rounded-full border border-white/10 border-dashed" />
              <div className="absolute left-8 -top-2 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.9)]" />
            </motion.div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white">
              <div className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="text-lg font-semibold tracking-tight">RM</span>
              </div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-200/70">Remoof</p>
              <p className="text-xs text-slate-300/80">Calibrating storefront systems…</p>
              <button
                type="button"
                onClick={() => setShouldShow(false)}
                className="mt-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/50"
              >
                Skip animation
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
