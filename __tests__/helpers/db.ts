import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

const prismaClient = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://billycampbell@localhost:5432/winston_ai_test?schema=public",
    },
  },
});

export const setupTestDatabase = async () => {
  // Clean up the database before tests
  await prismaClient.lead.deleteMany();
  await prismaClient.user.deleteMany();
  await prismaClient.account.deleteMany();
  await prismaClient.session.deleteMany();
};

export const teardownTestDatabase = async () => {
  await prismaClient.$disconnect();
};

export const createTestUser = async () => {
  return await prismaClient.user.create({
    data: {
      email: 'test@example.com',
      name: 'Test User',
    },
  });
};

export const createTestLead = async (userId: string) => {
  return await prismaClient.lead.create({
    data: {
      name: 'Test Lead',
      email: 'test@lead.com',
      status: 'Pending',
      userId,
    },
  });
};

export { prisma };

describe('Database Helpers', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('should connect to the database', async () => {
    const result = await prisma.$queryRaw`SELECT 1`;
    expect(result).toBeTruthy();
  });

  it('should handle database errors gracefully', async () => {
    try {
      await prisma.$queryRaw`SELECT * FROM non_existent_table`;
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
}); 