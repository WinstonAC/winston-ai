import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || 'Admin User';

  if (!email || !password) {
    console.error('Please provide email and password as arguments');
    console.error('Usage: ts-node scripts/create-admin.ts <email> <password> [name]');
    process.exit(1);
  }

  try {
    // Check if any users exist
    const existingUsers = await prisma.user.findMany();
    if (existingUsers.length > 0) {
      console.error('Users already exist in the database. This script is for first-time setup only.');
      process.exit(1);
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the admin user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        settings: {
          create: {
            emailNotifications: true,
            theme: 'dark',
          },
        },
      },
    });

    console.log('Admin user created successfully!');
    console.log('Email:', user.email);
    console.log('Name:', user.name);
    console.log('Role:', user.role);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 