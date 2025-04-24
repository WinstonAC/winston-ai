import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CampaignCreator } from '@/components/CampaignCreator';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

// Mock api utility
jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: '1', email: 'test@example.com' } },
    status: 'authenticated',
  }),
}));

const mockTemplates = [
  { id: '1', name: 'Template 1' },
  { id: '2', name: 'Template 2' },
];

const mockSegments = [
  { id: '1', name: 'Segment 1' },
  { id: '2', name: 'Segment 2' },
];

const mockLeads = [
  { id: '1', email: 'test1@example.com' },
  { id: '2', email: 'test2@example.com' },
];

describe('CampaignCreator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (api.get as jest.Mock).mockResolvedValue({ data: [] });
  });

  it('renders the component', () => {
    render(<CampaignCreator templates={mockTemplates} segments={mockSegments} leads={mockLeads} />);
    expect(screen.getByText('Create Campaign')).toBeInTheDocument();
  });

  it('opens create campaign modal when button is clicked', async () => {
    render(<CampaignCreator templates={mockTemplates} segments={mockSegments} leads={mockLeads} />);
    const createButton = screen.getByText('Create Campaign');
    await userEvent.click(createButton);
    expect(screen.getByLabelText('Campaign name')).toBeInTheDocument();
    expect(screen.getByLabelText('Campaign description')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Template')).toBeInTheDocument();
    expect(screen.getByLabelText('Segment')).toBeInTheDocument();
    expect(screen.getByLabelText('Target Audience')).toBeInTheDocument();
    expect(screen.getByLabelText('Schedule type')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<CampaignCreator templates={mockTemplates} segments={mockSegments} leads={mockLeads} />);
    const createButton = screen.getByText('Create Campaign');
    await userEvent.click(createButton);
    
    const submitButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(submitButton);

    expect(screen.getByText('Campaign name is required')).toBeInTheDocument();
    expect(screen.getByText('Description is required')).toBeInTheDocument();
    expect(screen.getByText('Please select an email template')).toBeInTheDocument();
    expect(screen.getByText('Please select a segment')).toBeInTheDocument();
  });

  it('creates a new campaign successfully', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ data: { id: '1', name: 'Test Campaign' } });

    render(<CampaignCreator templates={mockTemplates} segments={mockSegments} leads={mockLeads} />);
    const createButton = screen.getByText('Create Campaign');
    await userEvent.click(createButton);

    await userEvent.type(screen.getByLabelText('Campaign name'), 'Test Campaign');
    await userEvent.type(screen.getByLabelText('Campaign description'), 'Test Description');
    await userEvent.selectOptions(screen.getByLabelText('Email Template'), '1');
    await userEvent.selectOptions(screen.getByLabelText('Segment'), '1');
    await userEvent.selectOptions(screen.getByLabelText('Target Audience'), '1');
    await userEvent.selectOptions(screen.getByLabelText('Schedule type'), 'SEND_NOW');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('campaigns', expect.any(Object));
      expect(toast.success).toHaveBeenCalledWith('Campaign created successfully');
    });
  });

  it('handles campaign creation error', async () => {
    (api.post as jest.Mock).mockResolvedValueOnce({ error: 'Failed to create campaign' });

    render(<CampaignCreator templates={mockTemplates} segments={mockSegments} leads={mockLeads} />);
    const createButton = screen.getByText('Create Campaign');
    await userEvent.click(createButton);

    await userEvent.type(screen.getByLabelText('Campaign name'), 'Test Campaign');
    await userEvent.type(screen.getByLabelText('Campaign description'), 'Test Description');
    await userEvent.selectOptions(screen.getByLabelText('Email Template'), '1');
    await userEvent.selectOptions(screen.getByLabelText('Segment'), '1');
    await userEvent.selectOptions(screen.getByLabelText('Target Audience'), '1');
    await userEvent.selectOptions(screen.getByLabelText('Schedule type'), 'SEND_NOW');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to create campaign');
    });
  });

  it('deletes a campaign', async () => {
    (api.delete as jest.Mock).mockResolvedValueOnce({ data: { success: true } });

    render(<CampaignCreator templates={mockTemplates} segments={mockSegments} leads={mockLeads} />);
    const deleteButton = screen.getByTestId('confirm-delete');
    await userEvent.click(deleteButton);

    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith(expect.stringContaining('campaigns/'));
      expect(toast.success).toHaveBeenCalledWith('Campaign deleted successfully');
    });
  });
}); 