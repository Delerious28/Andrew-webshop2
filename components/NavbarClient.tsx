'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { ShoppingBag, ShieldCheck, LogOut, User } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { Session } from 'next-auth';
import { useCart } from './cart/CartProvider';

interface NavbarClientProps {
  session: Session | null;
  role?: string;
}

export function NavbarClient({ session, role }: NavbarClientProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isAdmin = role === 'ADMIN';

  return (
    <>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <Link
          href="/cart"
          className="relative rounded-full border border-slate-200 dark:border-slate-800 p-2 hover:bg-slate-100 dark:hover:bg-slate-900"
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && (
            <span className="absolute -right-1 -top-1 h-5 min-w-[20px] rounded-full bg-brand text-[11px] font-semibold text-white grid place-items-center px-1">
              {cartCount}
            </span>
          )}
        </Link>

        {!session ? (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-sm font-medium px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition"
          >
            Sign in
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="text-sm font-medium px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2"
            >
              {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
              <span className="hidden sm:inline">{isAdmin ? 'Admin' : session.user?.name}</span>
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
                <Link
                  href={isAdmin ? '/admin' : '/profile'}
                  className="block px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-2"
                  onClick={() => setIsProfileMenuOpen(false)}
                >
                  {isAdmin ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />} {isAdmin ? 'Admin dashboard' : 'My Profile'}
                </Link>
                <hr className="border-slate-200 dark:border-slate-700" />
                <button
                  onClick={() => {
                    signOut({ redirect: true, callbackUrl: '/' });
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}

        {role === 'ADMIN' && (
          <Link href="/admin" className="flex items-center gap-1 text-sm font-semibold text-brand px-4 py-2 rounded-lg bg-brand/10 hover:bg-brand/20 transition">
            <ShieldCheck className="h-4 w-4" /> Admin
          </Link>
        )}
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
