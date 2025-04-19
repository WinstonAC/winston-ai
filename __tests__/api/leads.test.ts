import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/leads';
import { setupTestDatabase, teardownTestDatabase, createTestUser } from '../helpers/db';

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

  it('should create a new lead', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'POST',
      body: {
        name: 'New Lead',
        email: 'new@lead.com',
        status: 'Pending',
      },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
    const data = JSON.parse(res._getData());
    expect(data.name).toBe('New Lead');
    expect(data.email).toBe('new@lead.com');
  });

  it('should fetch leads for a user', async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: 'GET',
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });
}); 