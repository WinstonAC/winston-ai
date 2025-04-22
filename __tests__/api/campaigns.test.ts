import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import { prisma } from '@/lib/prisma';
import { getSession } from 'next-auth/react';

jest.mock('next-auth/react');
jest.mock('@/lib/prisma');

describe('Campaigns API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/campaigns', () => {
    it('should return 401 if not authenticated', async () => {
      (getSession as jest.Mock).mockResolvedValue(null);
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await handler(req, res);

      expect(res.statusCode).toBe(401);
      expect(res._getJSONData()).toEqual({ error: 'Unauthorized' });
    });

    it('should return campaigns for authenticated user', async () => {
      const mockSession = {
        user: { email: 'test@example.com' },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
      (getSession as jest.Mock).mockResolvedValue(mockSession);
      
      const mockCampaigns = [
        { id: 1, name: 'Test Campaign', userId: '1' },
        { id: 2, name: 'Another Campaign', userId: '1' },
      ];
      (prisma.campaign.findMany as jest.Mock).mockResolvedValue(mockCampaigns);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
      });

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockCampaigns);
    });
  });

  describe('POST /api/campaigns', () => {
    it('should create a new campaign', async () => {
      const mockSession = {
        user: { email: 'test@example.com' },
        expires: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
      (getSession as jest.Mock).mockResolvedValue(mockSession);

      const newCampaign = {
        name: 'New Campaign',
        description: 'Test Description',
      };
      const createdCampaign = {
        id: 1,
        ...newCampaign,
        userId: '1',
      };
      (prisma.campaign.create as jest.Mock).mockResolvedValue(createdCampaign);

      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: newCampaign,
      });

      await handler(req, res);

      expect(res.statusCode).toBe(201);
      expect(res._getJSONData()).toEqual(createdCampaign);
    });
  });
}); 