import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ProductManager } from '@/components/ProductManager';
import { AdminOrders } from '@/components/AdminOrders';
import { AdminUsers } from '@/components/AdminUsers';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/signin');

  const [products, users, orders] = await Promise.all([
    prisma.product.findMany({ include: { images: true } }),
    prisma.user.findMany({ include: { addresses: true, orders: true } }),
    prisma.order.findMany({
      include: {
        address: true,
        user: { select: { name: true, email: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-2">
        <p className="text-sm text-slate-500">Admin control</p>
        <h1 className="text-3xl font-bold">Remoof operations</h1>
        <p className="text-slate-600 dark:text-slate-300">Manage catalogue, fulfillment, and customers in one view.</p>
      </header>

      <section className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <p className="text-sm text-slate-500">Products</p>
          <p className="text-3xl font-bold">{products.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-slate-500">Users</p>
          <p className="text-3xl font-bold">{users.length}</p>
        </div>
        <div className="glass-card p-4">
          <p className="text-sm text-slate-500">Orders</p>
          <p className="text-3xl font-bold">{orders.length}</p>
        </div>
      </section>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Catalogue</h2>
          <p className="text-sm text-slate-500">Create, edit, or delete bicycle components.</p>
        </div>
        <ProductManager products={products} />
      </section>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-sm text-slate-500">Update statuses and inspect line items.</p>
        </div>
        <AdminOrders orders={orders} />
      </section>

      <section className="glass-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Customers</h2>
          <p className="text-sm text-slate-500">Search and review user shipping details.</p>
        </div>
        <AdminUsers users={users} />
      </section>
    </div>
  );
}
