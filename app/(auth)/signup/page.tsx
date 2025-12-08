'use client';
import { useState } from 'react';
import { signupSchema } from '@/lib/validators';

export default function SignupPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const payload = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      password: formData.get('password'),
      acceptTerms: formData.get('terms') === 'on'
    } as any;
    const parse = signupSchema.safeParse(payload);
    if (!parse.success) {
      setMessage(parse.error.errors.map((e) => e.message).join(', '));
      setLoading(false);
      return;
    }
    const res = await fetch('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
    const data = await res.json();
    setMessage(data.message || 'Check your email to verify your account.');
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto glass-card p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create your Remoof account</h1>
        <p className="text-slate-600 dark:text-slate-300">Access secure checkout, saved addresses, and order history.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First name</label>
            <input name="firstName" placeholder="John" className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last name</label>
            <input name="lastName" placeholder="Doe" className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email address</label>
          <input name="email" type="email" placeholder="you@example.com" className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
          <input name="password" type="password" placeholder="Enter a secure password" className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-2" required />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input name="terms" type="checkbox" required /> I accept the <a href="/legal/terms" className="text-brand">Terms of Service</a>
        </label>
        <button disabled={loading} className="w-full bg-brand text-white py-2 rounded-lg font-semibold">{loading ? 'Creating...' : 'Sign up'}</button>
        {message && <p className="text-sm text-brand">{message}</p>}
      </form>
    </div>
  );
}
