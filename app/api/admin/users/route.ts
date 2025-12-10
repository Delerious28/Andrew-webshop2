import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { hash } from 'bcryptjs';

export async function GET() {
  const session = await getServerSession(authOptions);
  
  // Check if user is admin
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      emailVerified: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return NextResponse.json({ users });
}

// Create user
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
  }

  const body = await req.json();
  const { firstName, lastName, email, password, role = 'USER', verifyNow } = body;

  if (!firstName || !lastName || !email || !password) {
    return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ message: 'User already exists with this email' }, { status: 400 });
  }

  const hashed = await hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashed,
      role,
      emailVerified: verifyNow ? new Date() : null,
      verificationToken: verifyNow ? null : undefined
    },
    include: { addresses: true, orders: true }
  });

  const { password: _pw, ...safeUser } = newUser as any;

  return NextResponse.json({ user: safeUser, message: 'User created' });
}
