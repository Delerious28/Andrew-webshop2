import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const checkoutAddressSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postal: z.string().min(3),
  country: z.string().min(2)
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = checkoutAddressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ message: 'Invalid address details' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        cartItems: {
          include: { product: true }
        }
      }
    });

    if (!user || !user.cartItems || user.cartItems.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    const address = parsed.data;
    const existingAddress = await prisma.address.findFirst({ where: { userId: user.id } });
    if (existingAddress) {
      await prisma.address.update({
        where: { id: existingAddress.id },
        data: {
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postal: address.postal,
          country: address.country
        }
      });
    } else {
      await prisma.address.create({
        data: {
          userId: user.id,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          state: address.state,
          postal: address.postal,
          country: address.country
        }
      });
    }

    const lineItems = user.cartItems.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.title,
          description: item.product.description,
        },
        unit_amount: item.product.price,
      },
      quantity: item.quantity,
    }));

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: [
        'card',
        'ideal',
        'paypal',
        'sepa_debit',
        'bancontact',
        'alipay',
        'p24',
        'klarna',
      ],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.APP_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_BASE_URL}/cart`,
      customer_email: user.email ?? address.email,
      metadata: {
        userId: user.id,
        fullName: address.fullName,
        phone: address.phone ?? '',
        line1: address.line1,
        line2: address.line2 ?? '',
        city: address.city,
        state: address.state,
        postal: address.postal,
        country: address.country
      },
      locale: 'auto',
      shipping_address_collection: {
        allowed_countries: ['US', 'CA', 'GB', 'AU', 'NZ', 'DE', 'FR', 'NL', 'BE', 'ES', 'IT']
      },
      customer_update: { address: 'auto', shipping: 'auto' },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ message: 'Checkout failed' }, { status: 500 });
  }
}
