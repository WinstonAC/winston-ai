import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import analytics from '../analytics';
import campaigns from '../campaigns';
import leads from '../leads';
import team from '../team';
import { 
  mockGetServerSession, 
  createAuthenticatedRequest, 
  isUnauthorizedResponse 
} from '@/tests/utils/auth';

// Mock session
jest.mock('next-auth/react', () => ({
  getSession: jest.fn().mockResolvedValue({
    user: {
      id: 'test-user-id',
      email: 'test@example.com'
    }
  })
}));

describe('API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Analytics API', () => {
    it('should return analytics data for authenticated user', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { range: '30d' },
      });

      // Mock authenticated session
      mockGetServerSession({
        user: { id: 'test-user-id', teamId: 'test-team-id' }
      });

      await analytics(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toHaveProperty('totalLeads');
      expect(res._getJSONData()).toHaveProperty('openRate');
      expect(res._getJSONData()).toHaveProperty('responseRate');
      expect(res._getJSONData()).toHaveProperty('meetings');
      expect(res._getJSONData()).toHaveProperty('recentActivity');
      expect(res._getJSONData()).toHaveProperty('trends');
    });

    it('should return 401 for unauthenticated user', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'GET',
        query: { range: '30d' },
      });

      // Mock no session
      mockGetServerSession(null);

      await analytics(req, res);

      expect(isUnauthorizedResponse(res)).toBe(true);
    });
  });

  describe('Campaigns API', () => {
    it('should create a new campaign', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          name: 'Test Campaign',
          description: 'Test Description',
          templateId: 'template-1',
          targetAudience: { criteria: 'test' },
          schedule: { startDate: new Date() },
        },
      });

      // Mock authenticated session with team
      mockGetServerSession({
        user: { id: 'test-user-id', teamId: 'test-team-id' }
      });

      await campaigns(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toHaveProperty('id');
      expect(res._getJSONData()).toHaveProperty('name', 'Test Campaign');
    });

    it('should return 401 for unauthenticated campaign creation', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          name: 'Test Campaign',
        },
      });

      // Mock no session
      mockGetServerSession(null);

      await campaigns(req, res);

      expect(isUnauthorizedResponse(res)).toBe(true);
    });
  });

  describe('Leads API', () => {
    it('should create a new lead', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          name: 'Test Lead',
          email: 'test@example.com',
          company: 'Test Company',
          title: 'Test Title',
        },
      });

      // Mock authenticated session with team
      mockGetServerSession({
        user: { id: 'test-user-id', teamId: 'test-team-id' }
      });

      await leads(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toHaveProperty('id');
      expect(res._getJSONData()).toHaveProperty('name', 'Test Lead');
      expect(res._getJSONData()).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 for unauthenticated lead creation', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          name: 'Test Lead',
          email: 'test@example.com',
        },
      });

      // Mock no session
      mockGetServerSession(null);

      await leads(req, res);

      expect(isUnauthorizedResponse(res)).toBe(true);
    });
  });

  describe('Team API', () => {
    it('should create a new team', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          name: 'Test Team',
          members: [
            { userId: 'member-1', role: 'member' },
          ],
        },
      });

      // Mock authenticated session
      mockGetServerSession({
        user: { id: 'test-user-id' }
      });

      await team(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toHaveProperty('id');
      expect(res._getJSONData()).toHaveProperty('name', 'Test Team');
      expect(res._getJSONData().members).toHaveLength(2);
    });

    it('should return 401 for unauthenticated team creation', async () => {
      const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
        method: 'POST',
        body: {
          name: 'Test Team',
        },
      });

      // Mock no session
      mockGetServerSession(null);

      await team(req, res);

      expect(isUnauthorizedResponse(res)).toBe(true);
    });
  });
}); 