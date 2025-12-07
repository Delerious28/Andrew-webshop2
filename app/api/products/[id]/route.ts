import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { productSchema } from '@/lib/validators';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Params { params: { id: string } }

export async function GET(_: Request, { params }: Params) {
  const product = await prisma.product.findUnique({ where: { id: params.id }, include: { images: true } });
  if (!product) return NextResponse.json({ message: 'Not found' }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(req: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.message }, { status: 400 });
  const updated = await prisma.product.update({
    where: { id: params.id },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category,
      stock: parsed.data.stock,
      heroImage: parsed.data.heroImage,
      modelUrl: parsed.data.modelUrl
    }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: Params) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ message: 'Deleted' });
}
