import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      cartItems: {
        include: { product: { include: { images: true } } }
      }
    }
  });

  return NextResponse.json(user?.cartItems || []);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { productId, quantity = 1 } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  const cartItem = await prisma.cartItem.upsert({
    where: {
      userId_productId: {
        userId: user.id,
        productId
      }
    },
    update: {
      quantity: { increment: quantity }
    },
    create: {
      userId: user.id,
      productId,
      quantity
    },
    include: { product: { include: { images: true } } }
  });

  return NextResponse.json(cartItem, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { productId } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  await prisma.cartItem.delete({
    where: {
      userId_productId: {
        userId: user.id,
        productId
      }
    }
  });

  return NextResponse.json({ message: 'Removed from cart' });
}
