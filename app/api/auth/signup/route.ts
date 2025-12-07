import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validators';
import { hash } from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/mailer';
import crypto from 'crypto';

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.message }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (exists) return NextResponse.json({ message: 'Email already registered' }, { status: 400 });

  const verificationToken = crypto.randomUUID();
  const password = await hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      password,
      verificationToken,
      role: 'USER'
    }
  });

  try {
    await sendVerificationEmail(parsed.data.email, parsed.data.name, verificationToken);
  } catch (error) {
    console.error('Failed to send verification email:', error);
    // Don't fail account creation if email fails, but log it
  }

  return NextResponse.json({ message: 'Account created. Check your email to verify.' });
}
