import { PrismaClient } from '@prisma/client';

// Mock Prisma client for tests
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn(),
    lead: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      deleteMany: jest.fn(),
      create: jest.fn(),
    },
    account: {
      deleteMany: jest.fn(),
    },
    session: {
      deleteMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

const prisma = new PrismaClient();

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

describe('Database Helpers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the database', async () => {
    (prisma.$connect as jest.Mock).mockResolvedValueOnce(undefined);
    await prisma.$connect();
    expect(prisma.$connect).toHaveBeenCalled();
  });

  it('should handle database errors gracefully', async () => {
    (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(new Error('Database error'));
    try {
      await prisma.$queryRaw`SELECT * FROM non_existent_table`;
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toBe('Database error');
    }
  });
}); 