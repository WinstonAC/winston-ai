import { NextApiRequest, NextApiResponse } from 'next';
import { Session } from 'next-auth';
import { getServerSession } from 'next-auth';

// Mock session data type
export interface MockSessionData {
  user?: {
    id: string;
    email: string;
    name?: string;
    image?: string;
    role?: string;
    teamId?: string;
  };
  expires?: string;
}

// Default mock session data
const defaultMockSession: MockSessionData = {
  user: {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user',
  },
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

// Mock getServerSession for API routes
export const mockGetServerSession = (mockSession: Partial<MockSessionData> = {}) => {
  const session = { ...defaultMockSession, ...mockSession };
  jest.mock('next-auth', () => ({
    getServerSession: jest.fn().mockResolvedValue(session),
  }));
  return session;
};

// Mock useSession for client components
export const mockUseSession = (mockSession: Partial<MockSessionData> = {}) => {
  const session = { ...defaultMockSession, ...mockSession };
  jest.mock('next-auth/react', () => ({
    useSession: jest.fn().mockReturnValue({
      data: session,
      status: 'authenticated',
    }),
    getSession: jest.fn().mockResolvedValue(session),
  }));
  return session;
};

// Helper to create an authenticated request
export const createAuthenticatedRequest = (
  method: string,
  body?: any,
  query?: any,
  session: Partial<MockSessionData> = {}
) => {
  const req = {
    method,
    body,
    query,
    headers: {
      'content-type': 'application/json',
    },
  } as NextApiRequest;

  mockGetServerSession(session);

  return req;
};

// Helper to check if response is unauthorized
export const isUnauthorizedResponse = (res: NextApiResponse) => {
  return res.statusCode === 401 && res.getHeader('WWW-Authenticate') === 'Bearer';
};

// Helper to check if response is forbidden
export const isForbiddenResponse = (res: NextApiResponse) => {
  return res.statusCode === 403;
}; 