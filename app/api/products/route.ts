import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { productSchema } from '@/lib/validators';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const products = await prisma.product.findMany({ include: { images: true } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== 'ADMIN') return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: parsed.error.message }, { status: 400 });
  const created = await prisma.product.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category,
      stock: parsed.data.stock,
      heroImage: parsed.data.heroImage,
      modelUrl: parsed.data.modelUrl,
      images: parsed.data.images ? { create: parsed.data.images.map((url) => ({ url })) } : undefined
    }
  });
  return NextResponse.json(created, { status: 201 });
}
