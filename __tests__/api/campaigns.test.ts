import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import campaignsHandler from '@/pages/api/campaigns';

describe('Campaigns API', () => {
  let req: NextApiRequest;
  let res: NextApiResponse;

  beforeEach(() => {
    const { req: mockReq, res: mockRes } = createMocks<NextApiRequest, NextApiResponse>();
    req = mockReq;
    res = mockRes;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/campaigns', () => {
    it('should return 401 if not authenticated', async () => {
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

      req.method = 'GET';

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual(mockCampaigns);
    });

    it('should handle errors when fetching campaigns', async () => {
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
      expect(res._getJSONData()).toEqual({
        id: '1',
        name: 'New Campaign',
        description: 'New Description',
        status: 'draft',
        userId: 'test-user-id',
      });
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
      req.method = 'PUT';
      req.body = {
        id: '1',
        name: 'Updated Campaign',
        description: 'Updated Description',
        status: 'active',
      };

      await campaignsHandler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({
        id: '1',
        name: 'Updated Campaign',
        description: 'Updated Description',
        status: 'active',
      });
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