import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AddressForm } from '@/components/AddressForm';
import { OrderHistory } from '@/components/OrderHistory';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/signin');

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    include: {
      addresses: true,
      orders: { include: { items: { include: { product: true } } }, orderBy: { createdAt: 'desc' } }
    }
  });

  if (!user) redirect('/signin');

  const primaryAddress = user.addresses[0];

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Signed in as</p>
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-slate-600 dark:text-slate-300">{user.email}</p>
        </div>
        <span className="rounded-full border border-slate-200 dark:border-slate-800 px-4 py-2 text-sm font-semibold">
          Role: {(user.role as string) || 'USER'}
        </span>
      </header>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Shipping address</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">Add or update where we should ship your components.</p>
          </div>
        </div>
        <AddressForm initialAddress={primaryAddress || undefined} />
      </section>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Order history</h2>
            <p className="text-sm text-slate-500 dark:text-slate-300">Track fulfillment across all your Remoof builds.</p>
          </div>
        </div>
        <OrderHistory orders={user.orders} />
      </section>
    </div>
  );
}
