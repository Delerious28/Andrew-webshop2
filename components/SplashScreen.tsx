'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

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

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur">
      <div className="relative max-w-lg w-full mx-6 overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-black p-10 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand/10 via-transparent to-brand/30 blur-3xl" aria-hidden />
        <div className="relative space-y-6 text-center text-white">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand/20 text-brand">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-300">Remoof</p>
            <h2 className="text-3xl font-semibold leading-tight">Premium bicycle parts, crafted for speed.</h2>
            <p className="text-slate-300">
              Experience the refreshed Remoof storefront with immersive 3D previews, tuned checkout, and a polished admin-grade UI.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setShouldShow(false)}
              className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/30 transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
            >
              Enter Remoof
            </button>
            <button
              type="button"
              onClick={() => setShouldShow(false)}
              className="rounded-full border border-white/20 px-4 py-2 text-sm text-slate-200 transition hover:border-white/50"
            >
              Skip intro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
