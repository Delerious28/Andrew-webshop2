import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { addressSchema } from '@/lib/validators';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const addresses = await prisma.address.findMany({ where: { userId: session.user.id as string } });
  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = addressSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.message }, { status: 400 });

  const existing = await prisma.address.findFirst({ where: { userId: session.user.id as string } });
  if (existing) {
    const updated = await prisma.address.update({
      where: { id: existing.id },
      data: {
        line1: parsed.data.line1,
        line2: parsed.data.line2,
        city: parsed.data.city,
        state: parsed.data.state,
        postal: parsed.data.postal,
        country: parsed.data.country
      }
    });
    return NextResponse.json(updated);
  }

  const created = await prisma.address.create({
    data: {
      userId: session.user.id as string,
      line1: parsed.data.line1,
      line2: parsed.data.line2,
      city: parsed.data.city,
      state: parsed.data.state,
      postal: parsed.data.postal,
      country: parsed.data.country
    }
  });
  return NextResponse.json(created, { status: 201 });
}
