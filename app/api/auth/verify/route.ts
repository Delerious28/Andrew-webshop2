import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ message: 'Missing token' }, { status: 400 });
  const user = await prisma.user.findFirst({ where: { verificationToken: token } });
  if (!user) return NextResponse.json({ message: 'Invalid token' }, { status: 404 });

  // Create a one-time auto-login token
  const autoLoginToken = randomBytes(32).toString('hex');
  
  await prisma.user.update({ 
    where: { id: user.id }, 
    data: { 
      emailVerified: new Date(), 
      verificationToken: autoLoginToken // Reuse field temporarily for auto-login
    } 
  });
  
  return NextResponse.json({ 
    message: 'Email verified',
    autoLoginToken,
    success: true
  });
}
