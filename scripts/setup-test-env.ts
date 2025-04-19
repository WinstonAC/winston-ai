import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('Setting up test environment...');

  // Clean existing data
  await prisma.lead.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Create test user
  const hashedPassword = await bcrypt.hash(process.env.TEST_USER_PASSWORD || 'test_password_123', 10);
  const testUser = await prisma.user.create({
    data: {
      email: process.env.TEST_USER_EMAIL || 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
    },
  });

  // Create test leads
  await prisma.lead.createMany({
    data: [
      {
        name: 'Test Lead 1',
        email: 'lead1@test.com',
        status: 'Pending',
        userId: testUser.id,
      },
      {
        name: 'Test Lead 2',
        email: 'lead2@test.com',
        status: 'Sent',
        userId: testUser.id,
      },
    ],
  });

  console.log('Test environment setup complete!');
}

main()
  .catch((e) => {
    console.error('Error setting up test environment:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 