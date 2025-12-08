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
  
  // Use new media array if provided, otherwise fall back to images array
  const mediaToCreate = parsed.data.media || (parsed.data.images?.map((url) => ({ url, type: 'image' })) ?? []);
  
  const created = await prisma.product.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      category: parsed.data.category,
      stock: parsed.data.stock,
      images: mediaToCreate.length > 0 ? {
        create: mediaToCreate.map((media) => ({
          url: media.url,
          type: media.type,
          order: media.order ?? 0
        }))
      } : undefined
    },
    include: { images: true }
  });
  return NextResponse.json(created, { status: 201 });
}
