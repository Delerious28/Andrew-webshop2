import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  const { items, addressId } = await req.json();
  if (!Array.isArray(items) || !addressId) return NextResponse.json({ message: 'Invalid payload' }, { status: 400 });

  const lineItems = await Promise.all(
    items.map(async ({ productId, quantity }: any) => {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error('Product not found');
      return {
        price_data: {
          currency: 'usd',
          product_data: { name: product.title },
          unit_amount: product.price,
        },
        quantity,
      } as any;
    })
  );

  const checkout = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    success_url: `${process.env.APP_BASE_URL}/checkout?success=1`,
    cancel_url: `${process.env.APP_BASE_URL}/cart`,
    metadata: { userId: (session.user as any).id, addressId },
  });

  return NextResponse.json({ url: checkout.url });
}
