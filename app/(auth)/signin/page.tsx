'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { LegalModal } from '@/components/LegalModal';

export default function SigninPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!acceptedPolicies) {
      setError('Please review and accept the Terms of Service and Privacy Policy.');
      return;
    }
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      redirect: false,
      email: formData.get('email'),
      password: formData.get('password')
    });
    if (res?.error) setError(res.error);
    if (!res?.error) {
      const session = await fetch('/api/auth/session').then((r) => r.json());
      const role = (session?.user as any)?.role;
      router.push(role === 'ADMIN' ? '/admin' : '/profile');
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto glass-card p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-slate-600 dark:text-slate-300">Sign in to manage orders and checkout faster.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input name="email" type="email" placeholder="Email" className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" required />
        <input name="password" type="password" placeholder="Password" className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" required />
        <div className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/40">
          <input
            type="checkbox"
            checked={acceptedPolicies}
            onChange={(e) => setAcceptedPolicies(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
            required
          />
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <p className="font-semibold text-slate-800 dark:text-slate-100">I agree to the Terms of Service and Privacy Policy</p>
            <button
              type="button"
              onClick={() => setLegalOpen(true)}
              className="text-xs text-brand font-semibold flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" /> Review policies
            </button>
          </div>
        </div>
        <button disabled={loading || !acceptedPolicies} className="w-full bg-brand text-white py-2 rounded-lg font-semibold disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <a href="/forgot-password" className="text-sm text-brand">Forgot password?</a>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
      <LegalModal
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
        onAcknowledge={() => {
          setAcceptedPolicies(true);
          setLegalOpen(false);
        }}
      />
    </div>
  );
}
