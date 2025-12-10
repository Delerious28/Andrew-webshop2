import Link from 'next/link';
import { PageShell } from '@/components/PageShell';

export default function CheckoutSuccessPage() {
  return (
    <PageShell>
      <div className="space-y-4 max-w-2xl">
        <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-300">Payment complete</p>
        <h1 className="text-4xl font-bold">Thanks for your order</h1>
        <p className="text-slate-600 dark:text-slate-300">
          We&apos;re preparing your components. A receipt will be sent to your email shortly.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/products" className="rounded-xl bg-brand px-5 py-3 text-white font-semibold shadow hover:-translate-y-0.5 transition">
            Continue shopping
          </Link>
          <Link href="/profile" className="rounded-xl border border-slate-200 dark:border-slate-800 px-5 py-3 font-semibold hover:-translate-y-0.5 transition">
            View your profile
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
