import Link from 'next/link';
import { ThemeToggle } from './ThemeToggle';
import { ShoppingBag, ShieldCheck } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ProfileMenu } from './ProfileMenu';

export async function Navbar() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-semibold tracking-tight flex items-center gap-2">
            <span className="bg-brand text-white px-3 py-1 rounded-full">Remoof</span>
            <span className="hidden sm:inline">Bespoke Bicycle Parts</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/products" className="hover:text-brand">Products</Link>
            <Link href="/cart" className="hover:text-brand">Cart</Link>
            <Link href="/profile" className="hover:text-brand">Profile</Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/cart" className="rounded-full border border-slate-200 dark:border-slate-800 p-2 hover:bg-slate-100 dark:hover:bg-slate-900">
            <ShoppingBag className="h-5 w-5" />
          </Link>
          {session ? (
            <ProfileMenu name={session.user?.name} />
          ) : (
            <Link href="/signin" className="text-sm font-medium hover:text-brand">Sign in</Link>
          )}
          {role === 'ADMIN' && (
            <Link href="/admin" className="flex items-center gap-1 text-sm font-semibold text-brand">
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
