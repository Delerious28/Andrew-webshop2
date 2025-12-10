import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NavbarClient } from './NavbarClient';

export async function Navbar() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-950/70 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-xl font-semibold tracking-tight flex items-center gap-2 group">
            <Image src="/logo.svg" alt="Remoof" width={110} height={32} priority className="drop-shadow" />
            <span className="hidden sm:inline text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition">Bespoke Bicycle Parts</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm text-slate-600 dark:text-slate-300">
            <Link href="/products" className="px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">Products</Link>
            <Link href="/cart" className="px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cart</Link>
            <Link href="/contact" className="px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">Contact</Link>
            <Link href="/faq" className="px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition">FAQ</Link>
            {session && (
              <Link
                href={role === 'ADMIN' ? '/admin' : '/profile'}
                className="px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {role === 'ADMIN' ? 'Admin' : 'Profile'}
              </Link>
            )}
          </nav>
        </div>
        <NavbarClient session={session} role={role} />
      </div>
    </header>
  );
}
