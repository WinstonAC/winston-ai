import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://billycampbell@localhost:5432/winston_ai_test?schema=public",
    },
  },
});

export const setupTestDatabase = async () => {
  // Clean up the database before tests
  await prisma.lead.deleteMany();
  await prisma.user.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
};

export const teardownTestDatabase = async () => {
  await prisma.$disconnect();
};

export const createTestUser = async () => {
  return await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });
};

export const createTestLead = async (userId: string) => {
  return await prisma.lead.create({
    data: {
      name: 'Test Lead',
      email: 'test@lead.com',
      status: 'Pending',
      userId,
    },
  });
};

export { prisma }; 