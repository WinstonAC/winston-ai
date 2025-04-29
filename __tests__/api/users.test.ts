import { NextApiRequest, NextApiResponse } from 'next';
import handler from '@/pages/api/users';
import { supabase } from '@/lib/supabaseClient';

// Mock NextApiResponse
const mockResponse = () => {
  const res: Partial<NextApiResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as NextApiResponse;
};

describe('Users API', () => {
  let mockReq: NextApiRequest;
  let mockRes: NextApiResponse;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
    } as NextApiRequest;
    mockRes = mockResponse();
  });

  it('should return 405 for non-GET methods', async () => {
    mockReq.method = 'POST';
    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(405);
  });

  it('should return users data on successful GET', async () => {
    // Mock Supabase response
    const mockUsers = [{ id: 1, name: 'Test User' }];
    jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnValue({
        data: mockUsers,
        error: null,
      }),
    } as any);

    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockUsers);
  });

  it('should handle Supabase errors', async () => {
    // Mock Supabase error
    jest.spyOn(supabase, 'from').mockReturnValue({
      select: jest.fn().mockReturnValue({
        data: null,
        error: new Error('Database error'),
      }),
    } as any);

    await handler(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(500);
  });
}); 