import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { orderStatusSchema } from '@/lib/validators';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

interface Params { params: { id: string } }

export async function PATCH(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });

  const body = await req.json();
  const parsed = orderStatusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.message }, { status: 400 });

  const updated = await prisma.order.update({ where: { id: params.id }, data: { status: parsed.data.status } });
  return NextResponse.json(updated);
}
