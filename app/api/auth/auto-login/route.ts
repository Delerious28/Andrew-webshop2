import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { token } = await req.json();
  
  if (!token) {
    return NextResponse.json({ message: 'Missing token' }, { status: 400 });
  }

  // Find user with this auto-login token
  const user = await prisma.user.findFirst({ 
    where: { verificationToken: token } 
  });

  if (!user || !user.emailVerified) {
    return NextResponse.json({ message: 'Invalid or expired token' }, { status: 404 });
  }

  // Clear the auto-login token after use
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationToken: null }
  });

  return NextResponse.json({ 
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`
    }
  });
}
