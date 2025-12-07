'use client';
import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SigninPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await signIn('credentials', {
      redirect: true,
      callbackUrl: '/profile',
      email: formData.get('email'),
      password: formData.get('password')
    });
    if (res?.error) setError(res.error);
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
        <button disabled={loading} className="w-full bg-brand text-white py-2 rounded-lg font-semibold">{loading ? 'Signing in...' : 'Sign in'}</button>
        <a href="/reset" className="text-sm text-brand">Forgot password?</a>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </form>
    </div>
  );
}
