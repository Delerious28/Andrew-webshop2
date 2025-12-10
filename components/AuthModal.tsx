'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { LegalModal } from './LegalModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [legalOpen, setLegalOpen] = useState(false);
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!acceptedPolicies) {
      setError('Please review and accept the Terms of Service and Privacy Policy.');
      setLoading(false);
      return;
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false
    });

    if (result?.error) {
      setError(result.error);
    } else {
      const session = await fetch('/api/auth/session').then((res) => res.json());
      const role = (session?.user as any)?.role;
      onClose();
      window.location.href = role === 'ADMIN' ? '/admin' : '/profile';
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!acceptedPolicies) {
      setError('Please review and accept the Terms of Service and Privacy Policy.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, acceptTerms: acceptedPolicies })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Signup failed');
      } else {
        setError('');
        setMode('login');
        setPassword('');
        setEmail('');
        setFirstName('');
        setLastName('');
        const verificationLink = data.verificationToken
          ? `${window.location.origin}/verify?token=${data.verificationToken}`
          : null;
        alert(
          data.message ||
            (verificationLink
              ? `Account created. Use this link to verify: ${verificationLink}`
              : 'Account created! Check your email to verify.')
        );
      }
    } catch (err) {
      setError('An error occurred');
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm min-h-screen">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {mode === 'login' ? '🚴 Sign In' : '✨ Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-1 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {/* First Name field - only for signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  required={mode === 'signup'}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            )}

            {/* Last Name field - only for signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  required={mode === 'signup'}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="h-5 w-5 absolute left-3 top-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {mode === 'signup' && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  At least 8 characters
                </p>
              )}
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50 dark:bg-slate-900/40">
              <input
                id="accept-policies"
                type="checkbox"
                checked={acceptedPolicies}
                onChange={(e) => setAcceptedPolicies(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                required
              />
              <div className="text-sm text-slate-600 dark:text-slate-300">
                <label htmlFor="accept-policies" className="font-semibold text-slate-800 dark:text-slate-100 block">
                  I agree to the Terms of Service and Privacy Policy
                </label>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-brand" />
                  <button
                    type="button"
                    onClick={() => setLegalOpen(true)}
                    className="underline underline-offset-2 font-semibold"
                  >
                    Review policies and download copies
                  </button>
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !acceptedPolicies}
              className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : mode === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                OR
              </span>
            </div>
          </div>

          {/* Forgot Password / Toggle Mode */}
          <div className="space-y-2">
            {mode === 'login' && (
              <>
                <Link
                  href="/forgot-password"
                  onClick={onClose}
                  className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Forgot your password?
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className="w-full text-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition"
                >
                  Don't have an account? <span className="text-blue-600 dark:text-blue-400">Register</span>
                </button>
              </>
            )}

            {mode === 'signup' && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className="w-full text-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium transition"
              >
                Already have an account? <span className="text-blue-600 dark:text-blue-400">Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 text-xs text-slate-500 dark:text-slate-400 text-center space-y-1">
          <p>
            By continuing, you agree to our{' '}
            <Link
              href="/legal/terms"
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Terms of Service
            </Link>
          </p>
          <p>
            Read our{' '}
            <Link
              href="/legal/privacy"
              target="_blank"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
      </div>
      <LegalModal
        open={legalOpen}
        onClose={() => setLegalOpen(false)}
        initialTab="terms"
        onAcknowledge={() => {
          setAcceptedPolicies(true);
          setLegalOpen(false);
        }}
      />
    </>
  );
}
