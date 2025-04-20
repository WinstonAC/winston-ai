import { NextApiRequest, NextApiResponse } from 'next';
import { createMocks } from 'node-mocks-http';
import analytics from '../analytics';
import campaigns from '../campaigns';
import leads from '../leads';
import team from '../team';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  getSession: jest.fn(),
}));

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    lead: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    campaign: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    team: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
    },
  })),
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

      // Mock session
      (require('next-auth/react').getSession as jest.Mock).mockResolvedValue({
        user: { id: 'test-user-id' },
      });

      // Mock Prisma responses
      const mockPrisma = require('@prisma/client').PrismaClient;
      const prismaInstance = new mockPrisma();
      
      prismaInstance.lead.count.mockResolvedValue(100);
      prismaInstance.campaign.findMany.mockResolvedValue([
        {
          metrics: {
            sent: 50,
            opened: 25,
            replied: 10,
            meetings: 5,
          },
        },
      ]);
      prismaInstance.activity.findMany.mockResolvedValue([
        {
          id: '1',
          type: 'email_sent',
          lead: { name: 'Test Lead' },
          createdAt: new Date(),
        },
      ]);

      await analytics(req, res);

      expect(res._getStatusCode()).toBe(200);
      expect(res._getJSONData()).toHaveProperty('totalLeads');
      expect(res._getJSONData()).toHaveProperty('openRate');
      expect(res._getJSONData()).toHaveProperty('responseRate');
      expect(res._getJSONData()).toHaveProperty('meetings');
      expect(res._getJSONData()).toHaveProperty('recentActivity');
      expect(res._getJSONData()).toHaveProperty('trends');
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

      // Mock session
      (require('next-auth/react').getSession as jest.Mock).mockResolvedValue({
        user: { id: 'test-user-id' },
      });

      // Mock Prisma response
      const mockPrisma = require('@prisma/client').PrismaClient;
      const prismaInstance = new mockPrisma();
      
      prismaInstance.campaign.create.mockResolvedValue({
        id: 'campaign-1',
        name: 'Test Campaign',
        status: 'draft',
      });

      await campaigns(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toHaveProperty('id');
      expect(res._getJSONData()).toHaveProperty('name', 'Test Campaign');
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

      // Mock session
      (require('next-auth/react').getSession as jest.Mock).mockResolvedValue({
        user: { id: 'test-user-id' },
      });

      // Mock Prisma response
      const mockPrisma = require('@prisma/client').PrismaClient;
      const prismaInstance = new mockPrisma();
      
      prismaInstance.lead.create.mockResolvedValue({
        id: 'lead-1',
        name: 'Test Lead',
        email: 'test@example.com',
      });

      await leads(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toHaveProperty('id');
      expect(res._getJSONData()).toHaveProperty('name', 'Test Lead');
      expect(res._getJSONData()).toHaveProperty('email', 'test@example.com');
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

      // Mock session
      (require('next-auth/react').getSession as jest.Mock).mockResolvedValue({
        user: { id: 'test-user-id' },
      });

      // Mock Prisma response
      const mockPrisma = require('@prisma/client').PrismaClient;
      const prismaInstance = new mockPrisma();
      
      prismaInstance.team.create.mockResolvedValue({
        id: 'team-1',
        name: 'Test Team',
        members: [
          { userId: 'test-user-id', role: 'admin' },
          { userId: 'member-1', role: 'member' },
        ],
      });

      await team(req, res);

      expect(res._getStatusCode()).toBe(201);
      expect(res._getJSONData()).toHaveProperty('id');
      expect(res._getJSONData()).toHaveProperty('name', 'Test Team');
      expect(res._getJSONData().members).toHaveLength(2);
    });
  });
}); 