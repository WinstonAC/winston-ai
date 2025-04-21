import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Campaigns from '../../pages/campaigns';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.Mock;

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn()
}));
const mockUseRouter = useRouter as jest.Mock;

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('Campaigns Page', () => {
  const mockSession = {
    data: {
      user: { id: '1', email: 'test@example.com' },
      expires: '2024-12-31'
    },
    status: 'authenticated'
  };

  const mockRouter = {
    push: jest.fn(),
    reload: jest.fn()
  };

  const mockData = {
    templates: [
      { id: '1', name: 'Welcome Email', subject: 'Welcome!' },
      { id: '2', name: 'Follow-up Email', subject: 'Following up' }
    ],
    segments: [
      { id: '1', name: 'All Leads' },
      { id: '2', name: 'New Leads' }
    ],
    leads: [
      { id: '1', name: 'John Doe', email: 'john@example.com', company: 'Acme Inc', title: 'CEO' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', company: 'Tech Corp', title: 'CTO' }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSession.mockReturnValue(mockSession);
    mockUseRouter.mockReturnValue(mockRouter);

    // Mock successful API responses
    mockFetch.mockImplementation((url) => {
      const data = {
        '/api/templates': mockData.templates,
        '/api/segments': mockData.segments,
        '/api/leads': mockData.leads
      }[url];

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(data)
      });
    });
  });

  it('renders loading state initially', () => {
    render(<Campaigns />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the campaign page with data', async () => {
    render(<Campaigns />);

    await waitFor(() => {
      expect(screen.getByText('CAMPAIGN_MANAGER_')).toBeInTheDocument();
      expect(screen.getByText('CREATE_AND_MANAGE_YOUR_EMAIL_CAMPAIGNS_')).toBeInTheDocument();
    });
  });

  it('handles API error states', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    render(<Campaigns />);

    await waitFor(() => {
      expect(screen.getByText('Error: Failed to fetch data')).toBeInTheDocument();
    });
  });

  it('creates a campaign successfully', async () => {
    const newCampaign = {
      name: 'Test Campaign',
      description: 'Test Description',
      templateId: '1',
      targetAudience: { segment: '1', filters: {} },
      schedule: { type: 'immediate' }
    };

    mockFetch.mockImplementation((url, options) => {
      if (url === '/api/campaigns' && options.method === 'POST') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ ...newCampaign, id: '123' })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });

    render(<Campaigns />);

    await waitFor(() => {
      expect(screen.getByText('CAMPAIGN_MANAGER_')).toBeInTheDocument();
    });

    // Create campaign
    const result = await screen.getByText('Campaign created successfully!');
    expect(result).toBeInTheDocument();
    expect(mockRouter.push).toHaveBeenCalledWith('/campaigns/123');
  });

  it('updates a campaign successfully', async () => {
    const updatedCampaign = {
      id: '123',
      name: 'Updated Campaign',
      description: 'Updated Description',
      templateId: '1',
      targetAudience: { segment: '1', filters: {} },
      schedule: { type: 'immediate' }
    };

    mockFetch.mockImplementation((url, options) => {
      if (url === '/api/campaigns/123' && options.method === 'PUT') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(updatedCampaign)
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });

    render(<Campaigns />);

    await waitFor(() => {
      expect(screen.getByText('CAMPAIGN_MANAGER_')).toBeInTheDocument();
    });

    // Update campaign
    const result = await screen.getByText('Campaign updated successfully!');
    expect(result).toBeInTheDocument();
  });

  it('deletes a campaign successfully', async () => {
    mockFetch.mockImplementation((url, options) => {
      if (url === '/api/campaigns/123' && options.method === 'DELETE') {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({})
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([])
      });
    });

    render(<Campaigns />);

    await waitFor(() => {
      expect(screen.getByText('CAMPAIGN_MANAGER_')).toBeInTheDocument();
    });

    // Delete campaign
    const result = await screen.getByText('Campaign deleted successfully!');
    expect(result).toBeInTheDocument();
    expect(mockRouter.reload).toHaveBeenCalled();
  });

  it('handles unauthorized access', () => {
    mockUseSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    render(<Campaigns />);
    expect(screen.queryByText('CAMPAIGN_MANAGER_')).not.toBeInTheDocument();
  });
}); 