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
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      password,
      verificationToken,
      role: 'USER'
    }
  });

  let emailSent = true;
  try {
    await sendVerificationEmail(
      parsed.data.email,
      `${parsed.data.firstName} ${parsed.data.lastName}`,
      verificationToken
    );
  } catch (error) {
    console.error('Failed to send verification email:', error);
    emailSent = false;
  }

  return NextResponse.json({
    message: emailSent
      ? 'Account created. Check your email to verify.'
      : 'Account created. Verification email could not be delivered—use the provided link to verify.',
    emailSent,
    verificationToken: emailSent ? undefined : verificationToken
  });
}
