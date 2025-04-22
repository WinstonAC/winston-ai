import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/leads';
import { setupTestDatabase, teardownTestDatabase, createTestUser } from '../helpers/db';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';

// Mock the entire next-auth module
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  })),
}));

// Mock the auth options
jest.mock('@/pages/api/auth/[...nextauth]', () => {
  const mockNextAuth = jest.fn(() => ({}));
  mockNextAuth.default = mockNextAuth;
  return {
    authOptions: {
      adapter: null,
      providers: [],
      session: {
        strategy: 'jwt',
      },
      callbacks: {
        session: ({ session, token }) => {
          if (session?.user) {
            session.user.id = token.sub;
          }
          return session;
        },
      },
    },
  };
});

jest.mock('next-auth/react');
jest.mock('@/lib/prisma');

describe('Leads API', () => {
  let testUser: any;

  beforeEach(async () => {
    await setupTestDatabase();
    testUser = await createTestUser();
    // Update the mock to use the actual test user ID
    const { getServerSession } = require('next-auth/next');
    getServerSession.mockImplementation(() => ({
      user: {
        id: testUser.id,
        email: testUser.email,
      },
    }));
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/leads', () => {
    it('should return 401 if not authenticated', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await handler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({ error: 'Unauthorized' });
    });

    it('should return leads for authenticated user', async () => {
      const mockSession = {
        user: { email: 'test@example.com' },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
      (getSession as jest.Mock).mockResolvedValue(mockSession);
      
      const mockLeads = [
        { id: 1, name: 'Test Lead', email: 'test@example.com', userId: '1' },
        { id: 2, name: 'Another Lead', email: 'another@example.com', userId: '1' },
      ];
      (prisma.lead.findMany as jest.Mock).mockResolvedValue(mockLeads);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockLeads);
    });
  });

  describe('POST /api/leads', () => {
    it('should create a new lead', async () => {
      const mockSession = {
        user: { email: 'test@example.com' },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
      (getSession as jest.Mock).mockResolvedValue(mockSession);

      const newLead = {
        name: 'New Lead',
        email: 'new@example.com',
        phone: '1234567890',
      };
      const createdLead = {
        id: 1,
        ...newLead,
        userId: '1',
      };
      (prisma.lead.create as jest.Mock).mockResolvedValue(createdLead);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: newLead,
      });

      await handler(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual(createdLead);
    });
  });

  describe('PUT /api/leads/:id', () => {
    it('should update an existing lead', async () => {
      const mockSession = {
        user: { email: 'test@example.com' },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
      (getSession as jest.Mock).mockResolvedValue(mockSession);

      const updatedLead = {
        name: 'Updated Lead',
        email: 'updated@example.com',
        phone: '0987654321',
      };
      const existingLead = {
        id: 1,
        ...updatedLead,
        userId: '1',
      };
      (prisma.lead.update as jest.Mock).mockResolvedValue(existingLead);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'PUT',
        query: { id: '1' },
        body: updatedLead,
      });

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(existingLead);
    });
  });

  describe('DELETE /api/leads/:id', () => {
    it('should delete an existing lead', async () => {
      const mockSession = {
        user: { email: 'test@example.com' },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
      (getSession as jest.Mock).mockResolvedValue(mockSession);

      (prisma.lead.delete as jest.Mock).mockResolvedValue({ id: 1 });

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'DELETE',
        query: { id: '1' },
      });

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ success: true });
    });
  });
}); 