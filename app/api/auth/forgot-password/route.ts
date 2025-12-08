import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { sendPasswordResetEmail } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ message: 'Email required' }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // Don't reveal if email exists for security
    return NextResponse.json({ message: 'If that email is registered, you will receive a password reset link.' });
  }

  const resetToken = crypto.randomUUID();
  const resetTokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: { resetToken, resetTokenExpiry }
  });

  try {
    await sendPasswordResetEmail(email, `${user.firstName} ${user.lastName}`, resetToken);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
  }

  return NextResponse.json({ message: 'If that email is registered, you will receive a password reset link.' });
}
