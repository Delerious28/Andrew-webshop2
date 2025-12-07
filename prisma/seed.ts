import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('Password123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@remoof.bike' },
    update: {},
    create: {
      email: 'admin@remoof.bike',
      name: 'Remoof Admin',
      password,
      role: 'ADMIN',
      emailVerified: new Date()
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'rider@remoof.bike' },
    update: {},
    create: {
      email: 'rider@remoof.bike',
      name: 'Everyday Rider',
      password,
      role: 'USER',
      emailVerified: new Date(),
      addresses: {
        create: {
          line1: '123 Bike Lane',
          city: 'Copenhagen',
          state: 'Capital',
          postal: '2100',
          country: 'Denmark'
        }
      }
    },
  });

  await prisma.product.deleteMany();

  await prisma.product.create({
    data: {
      title: 'Remoof Carbon Wheelset',
      description: 'Ultra-light carbon wheels for speed and stability.',
      price: 129900,
      category: 'Wheels',
      stock: 15,
      heroImage: 'https://images.unsplash.com/photo-1529429617124-aee78b477660?auto=format&fit=crop&w=1200&q=80',
      modelUrl: 'https://cdn.remoof.bike/models/wheel.glb',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1529429617124-aee78b477660?auto=format&fit=crop&w=1200&q=80' },
          { url: 'https://images.unsplash.com/photo-1508970057347-9f41ec2b3d09?auto=format&fit=crop&w=1200&q=80' }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      title: 'Aero Handlebar Kit',
      description: 'Ergonomic aero bars built for endurance rides.',
      price: 25900,
      category: 'Cockpit',
      stock: 30,
      heroImage: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1508609349937-5ec4ae374ebf?auto=format&fit=crop&w=1200&q=80' }
        ]
      }
    }
  });

  await prisma.product.create({
    data: {
      title: 'Precision Ceramic Bottom Bracket',
      description: 'Smooth rolling bracket with sealed ceramic bearings.',
      price: 18900,
      category: 'Drivetrain',
      stock: 40,
      heroImage: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=80',
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1516117172878-fd2c41f4a759?auto=format&fit=crop&w=1200&q=80' }
        ]
      }
    }
  });

  console.log({ admin, user });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
