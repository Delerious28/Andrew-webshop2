import { prisma } from '@/lib/prisma';

export async function requireVerifiedEmail(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user?.emailVerified) {
    throw new Error('Please verify your email before checking out');
  }
  
  return user;
}

export async function checkEmailVerification(userId: string) {
  const user = await prisma.user.findUnique({ 
    where: { id: userId },
    select: { emailVerified: true, email: true }
  });
  
  return {
    isVerified: !!user?.emailVerified,
    email: user?.email
  };
}
