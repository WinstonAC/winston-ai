import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import campaignsHandler from '@/pages/api/campaigns';
import { PrismaClient } from '@prisma/client';
import { getSession } from 'next-auth/react';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    campaign: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

describe('Campaigns API', () => {
  let prisma: PrismaClient;
  let req: NextApiRequest;
  let res: NextApiResponse;

  beforeEach(() => {
    prisma = new PrismaClient();
    const { req: mockReq, res: mockRes } = createMocks<NextApiRequest, NextApiResponse>();
    req = mockReq;
    res = mockRes;
    (getSession as jest.Mock).mockResolvedValue({ user: { id: 'test-user-id' } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/campaigns', () => {
    it('should return 401 if not authenticated', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);
      req.method = 'GET';

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({ error: 'Unauthorized' });
    });

    it('should return campaigns for authenticated user', async () => {
      const mockCampaigns = [
        {
          id: '1',
          name: 'Test Campaign',
          description: 'Test Description',
          status: 'draft',
          userId: 'test-user-id',
        },
      ];

      (prisma.campaign.findMany as jest.Mock).mockResolvedValue(mockCampaigns);
      req.method = 'GET';

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockCampaigns);
    });

    it('should handle errors when fetching campaigns', async () => {
      (prisma.campaign.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));
      req.method = 'GET';

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        error: 'Failed to fetch campaigns',
        details: 'Database error',
      });
    });
  });

  describe('POST /api/campaigns', () => {
    it('should create a new campaign', async () => {
      const mockCampaign = {
        id: '1',
        name: 'New Campaign',
        description: 'New Description',
        status: 'draft',
        userId: 'test-user-id',
      };

      (prisma.campaign.create as jest.Mock).mockResolvedValue(mockCampaign);
      req.method = 'POST';
      req.body = {
        name: 'New Campaign',
        description: 'New Description',
        templateId: 'template-1',
        targetAudience: {
          segment: 'segment-1',
          filters: {},
        },
        schedule: {
          type: 'immediate',
        },
      };

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual(mockCampaign);
    });

    it('should validate required fields', async () => {
      req.method = 'POST';
      req.body = {};

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: 'Missing required fields',
        details: {
          name: 'Campaign name is required',
          templateId: 'Template ID is required',
          targetAudience: 'Target audience is required',
          schedule: 'Schedule is required',
        },
      });
    });
  });

  describe('PUT /api/campaigns', () => {
    it('should update an existing campaign', async () => {
      const mockCampaign = {
        id: '1',
        name: 'Updated Campaign',
        description: 'Updated Description',
        status: 'active',
      };

      (prisma.campaign.update as jest.Mock).mockResolvedValue(mockCampaign);
      req.method = 'PUT';
      req.body = {
        id: '1',
        name: 'Updated Campaign',
        description: 'Updated Description',
        status: 'active',
      };

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockCampaign);
    });

    it('should require campaign ID for update', async () => {
      req.method = 'PUT';
      req.body = {
        name: 'Updated Campaign',
      };

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: 'Campaign ID is required',
      });
    });
  });

  describe('DELETE /api/campaigns', () => {
    it('should delete a campaign', async () => {
      (prisma.campaign.delete as jest.Mock).mockResolvedValue({});
      req.method = 'DELETE';
      req.query = { id: '1' };

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(204);
    });

    it('should require campaign ID for deletion', async () => {
      req.method = 'DELETE';
      req.query = {};

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        error: 'Campaign ID is required',
      });
    });
  });

  it('should handle unsupported methods', async () => {
    req.method = 'PATCH';

    await campaignsHandler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res._getJSONData()).toEqual({
      error: 'Method PATCH not allowed',
    });
    expect(res.getHeader('Allow')).toEqual(['GET', 'POST', 'PUT', 'DELETE']);
  });
}); 