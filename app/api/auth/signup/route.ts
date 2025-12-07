import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { signupSchema } from '@/lib/validators';
import { hash } from 'bcryptjs';
import { sendMail } from '@/lib/mailer';
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

  const verifyLink = `${process.env.APP_BASE_URL}/verify?token=${verificationToken}`;
  await sendMail({
    to: parsed.data.email,
    subject: 'Verify your Remoof account',
    html: `<p>Welcome to Remoof!</p><p>Confirm your email to start ordering: <a href="${verifyLink}">${verifyLink}</a></p>`
  });

  return NextResponse.json({ message: 'Account created. Check your email to verify.' });
}
