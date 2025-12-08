import { prisma } from '../lib/prisma';

async function makeAdmin() {
  const users = await prisma.user.findMany();
  console.log('Current users:');
  users.forEach((user, index) => {
    console.log(`${index + 1}. ${user.email} - Role: ${user.role}`);
  });

  // Update the first user to admin (or specify email)
  const email = process.argv[2];
  
  if (!email) {
    console.log('\nUsage: npx tsx scripts/make-admin.ts your@email.com');
    return;
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' }
  });

  console.log(`\n✅ Updated ${updated.email} to ADMIN role`);
}

makeAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
