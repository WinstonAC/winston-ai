import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabase';
import {
  mockSupabaseAuth,
} from '@/tests/utils/auth';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
      getSession: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  teamId: 'test-team-id',
};

describe('API Routes Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/analytics', () => {
    it('should return 401 when no authorization header', async () => {
      const req = {
        method: 'GET',
        headers: {},
      } as NextApiRequest;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as NextApiResponse;

      // Mock no auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('No token provided')
      });

      const handler = require('@/pages/api/analytics').default;
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return analytics data when authenticated', async () => {
      // Mock authenticated user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const req = {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
        query: { range: '30d' },
      } as NextApiRequest;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as NextApiResponse;

      const handler = require('@/pages/api/analytics').default;
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('POST /api/activity/log', () => {
    it('should return 401 when no authorization header', async () => {
      const req = {
        method: 'POST',
        headers: {},
        body: { type: 'test', description: 'test' },
      } as NextApiRequest;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as NextApiResponse;

      // Mock no auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('No token provided')
      });

      const handler = require('@/pages/api/activity/log').default;
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should log activity when authenticated', async () => {
      // Mock authenticated user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const req = {
        method: 'POST',
        headers: { authorization: 'Bearer valid-token' },
        body: { type: 'test', description: 'test activity' },
      } as NextApiRequest;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as NextApiResponse;

      const handler = require('@/pages/api/activity/log').default;
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('GET /api/activity/list', () => {
    it('should return 401 when no authorization header', async () => {
      const req = {
        method: 'GET',
        headers: {},
        query: { teamId: 'test-team-id' },
      } as NextApiRequest;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as NextApiResponse;

      // Mock no auth
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: new Error('No token provided')
      });

      const handler = require('@/pages/api/activity/list').default;
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return activities when authenticated', async () => {
      // Mock authenticated user
      (supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const req = {
        method: 'GET',
        headers: { authorization: 'Bearer valid-token' },
        query: { teamId: 'test-team-id' },
      } as NextApiRequest;
      
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      } as unknown as NextApiResponse;

      const handler = require('@/pages/api/activity/list').default;
      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
}); 