import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminDashboard } from '@/components/AdminDashboard';
import { PageShell } from '@/components/PageShell';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/signin');

  const [products, users, orders, faqs] = await Promise.all([
    prisma.product.findMany({ include: { images: true } }),
    prisma.user.findMany({ include: { addresses: true, orders: true } }),
    prisma.order.findMany({
      include: {
        address: true,
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { product: true } }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.faqEntry.findMany({ orderBy: { order: 'asc' } })
  ]);

  const parsedFaqs = faqs.map((faq) => ({
    ...faq,
    blocks: safeParse(faq.blocks)
  }));

  return (
    <PageShell>
      <div className="space-y-8">
        <header className="flex flex-col gap-2">
          <p className="text-sm text-slate-500">Admin control</p>
          <h1 className="text-3xl font-bold">Remoof operations</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage catalogue, fulfillment, and customers in one view.</p>
        </header>

        <AdminDashboard
          products={products}
          users={users}
          orders={orders}
          faqs={parsedFaqs}
        />
      </div>
    </PageShell>
  );
}

function safeParse(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (error) {
    return [];
  }
}
