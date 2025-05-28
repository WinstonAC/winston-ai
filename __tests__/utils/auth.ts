import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';

// Mock user data type
export interface MockUserData {
  id: string;
  email: string;
  name?: string;
  role?: string;
  teamId?: string;
}

// Default mock user data
const defaultMockUser: MockUserData = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  teamId: 'test-team-id',
};

// Mock Supabase auth for API routes
export const mockSupabaseAuth = (mockUser: Partial<MockUserData> = {}) => {
  const user = { ...defaultMockUser, ...mockUser };
  
  jest.mock('@/lib/supabase', () => ({
    supabase: {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user },
          error: null
        }),
        getSession: jest.fn().mockResolvedValue({
          data: { session: { user } },
          error: null
        })
      }
    }
  }));
};

// Mock useAuth for client components
export const mockUseAuth = (mockUser: Partial<MockUserData> = {}) => {
  const user = { ...defaultMockUser, ...mockUser };
  
  jest.mock('@/contexts/AuthContext', () => ({
    useAuth: jest.fn().mockReturnValue({
      user,
      loading: false,
      signIn: jest.fn(),
      signOut: jest.fn(),
    }),
  }));
};

// Helper to setup authenticated test environment
export const setupAuthenticatedTest = (user: Partial<MockUserData> = {}) => {
  mockSupabaseAuth(user);
  mockUseAuth(user);
};

// Helper to create an authenticated request
export const createAuthenticatedRequest = (
  method: string,
  body?: any,
  query?: any,
  session: Partial<MockUserData> = {}
) => {
  const req = {
    method,
    body,
    query,
    headers: {
      'content-type': 'application/json',
    },
  } as NextApiRequest;

  mockSupabaseAuth(session);

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