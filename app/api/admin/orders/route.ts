import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
      address: true,
      items: { include: { product: { select: { title: true } } } }
    },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json(orders);
}
