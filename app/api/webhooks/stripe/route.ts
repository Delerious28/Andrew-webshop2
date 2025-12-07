import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('stripe-signature') as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err: any) {
    return NextResponse.json({ message: `Webhook error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const addressId = session.metadata?.addressId;
    if (session.amount_total && userId && addressId) {
      await prisma.order.create({
        data: {
          userId,
          addressId,
          status: 'PAID',
          total: session.amount_total,
          stripeId: session.id,
          items: {
            create: [] // hydrate via metadata in production
          }
        }
      });
    }
  }

  return NextResponse.json({ received: true });
}
