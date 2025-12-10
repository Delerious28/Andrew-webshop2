"use client";
import { useState } from 'react';
import { PageShell } from '@/components/PageShell';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  return (
    <PageShell>
      <div className="space-y-6">
      <header className="space-y-2">
        <p className="chip">Support</p>
        <h1 className="text-3xl font-bold">Contact us</h1>
        <p className="text-slate-600 dark:text-slate-300">Need help with an order or catalogue update? Reach our team below.</p>
      </header>
      <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
        {['Orders', 'Returns', 'Technical setup'].map((pill) => (
          <span key={pill} className="chip bg-slate-100 dark:bg-slate-900/60">{pill}</span>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card-surface p-5 space-y-2 transition hover:-translate-y-1 hover:shadow-lg">
          <p className="font-semibold">Email</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">support@remoof.example</p>
          <p className="text-xs text-slate-500">Replies within one business day.</p>
        </div>
        <div className="card-surface p-5 space-y-2 transition hover:-translate-y-1 hover:shadow-lg">
          <p className="font-semibold">Phone</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">+1 (555) 014-2255</p>
          <p className="text-xs text-slate-500">Mon–Fri, 9am–5pm PST.</p>
        </div>
        <div className="card-surface p-5 space-y-2 transition hover:-translate-y-1 hover:shadow-lg">
          <p className="font-semibold">Showroom</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">128 Rim Street, Portland, OR</p>
          <p className="text-xs text-slate-500">Book fittings or pick-ups by appointment.</p>
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-6 bg-white/70 dark:bg-slate-900/60 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-semibold">Open a support form</p>
            <p className="text-sm text-slate-600 dark:text-slate-300">We typically reply within 2 business hours.</p>
          </div>
          {submitted && <span className="text-sm text-emerald-600 dark:text-emerald-400 font-semibold">Thanks — message sent!</span>}
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
          <input required placeholder="Full name" className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" />
          <input required type="email" placeholder="Email" className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" />
          <select className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2">
            <option>Orders</option>
            <option>Returns</option>
            <option>Technical setup</option>
          </select>
          <input placeholder="Order number (optional)" className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" />
          <textarea required placeholder="How can we help?" className="rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2 md:col-span-2" rows={4} />
          <button type="submit" className="md:col-span-2 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-brand text-white font-semibold shadow hover:-translate-y-0.5 transition">
            Send message
          </button>
        </form>
        <div className="flex flex-wrap gap-3 text-xs text-slate-600 dark:text-slate-300">
          <span className="chip">Average reply: 2 hours</span>
          <span className="chip">Stripe verified</span>
          <span className="chip">Trusted by riders</span>
        </div>
      </div>
      </div>
    </PageShell>
  );
}
