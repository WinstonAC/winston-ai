import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/leads';

// Mock Supabase auth
jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

const { supabase } = require('@/lib/supabase');

function createMockRequest(method: string, headers: Record<string, string> = {}): NextApiRequest {
  return {
    method,
    headers,
    body: {},
    query: {},
  } as NextApiRequest;
}

function createMockResponse(): NextApiResponse {
  const res = {} as NextApiResponse;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  return res;
}

describe('/api/leads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/leads', () => {
    it('should return 401 when no authorization header', async () => {
      const req = createMockRequest('GET');
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return 401 when invalid token', async () => {
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('Invalid token')
      });

      const req = createMockRequest('GET', { authorization: 'Bearer invalid-token' });
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should return leads when authenticated', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const req = createMockRequest('GET', { authorization: 'Bearer valid-token' });
      const res = createMockResponse();

      await handler(req, res);

      expect(supabase.auth.getUser).toHaveBeenCalledWith('valid-token');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('POST /api/leads', () => {
    it('should return 401 when no authorization header', async () => {
      const req = createMockRequest('POST');
      const res = createMockResponse();

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('should create lead when authenticated', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const req = createMockRequest('POST', { authorization: 'Bearer valid-token' });
      req.body = {
        name: 'John Doe',
        email: 'john@example.com',
        company: 'Acme Corp'
      };
      const res = createMockResponse();

      await handler(req, res);

      expect(supabase.auth.getUser).toHaveBeenCalledWith('valid-token');
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
}); 