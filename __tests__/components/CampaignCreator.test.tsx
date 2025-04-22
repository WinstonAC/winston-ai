import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CampaignCreator } from '@/components/CampaignCreator';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}));

// Mock API calls
jest.mock('@/lib/api', () => ({
  createCampaign: jest.fn(),
  updateCampaign: jest.fn(),
  deleteCampaign: jest.fn(),
  getCampaigns: jest.fn(),
  getTemplates: jest.fn(),
  getSegments: jest.fn(),
}));

describe('CampaignCreator', () => {
  const mockSession = {
    data: {
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'admin',
      },
    },
    status: 'authenticated',
  };

  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue(mockSession);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', () => {
    render(<CampaignCreator />);
    expect(screen.getByRole('button', { name: 'open-create-campaign-modal' })).toBeInTheDocument();
  });

  it('opens the create campaign modal', () => {
    render(<CampaignCreator />);
    fireEvent.click(screen.getByRole('button', { name: 'open-create-campaign-modal' }));
    expect(screen.getByRole('heading', { name: 'CREATE_CAMPAIGN_' })).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<CampaignCreator />);
    fireEvent.click(screen.getByRole('button', { name: 'open-create-campaign-modal' }));
    fireEvent.click(screen.getByRole('button', { name: 'submit-create-campaign' }));

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Template is required')).toBeInTheDocument();
      expect(screen.getByText('Target segment is required')).toBeInTheDocument();
    });
  });

  it('creates a campaign successfully', async () => {
    const mockCreateCampaign = jest.fn().mockResolvedValue({ id: '1' });
    require('@/lib/api').createCampaign = mockCreateCampaign;

    render(<CampaignCreator />);
    fireEvent.click(screen.getByRole('button', { name: 'open-create-campaign-modal' }));

    fireEvent.change(screen.getByLabelText('Campaign name'), { target: { value: 'Test Campaign' } });
    fireEvent.change(screen.getByLabelText('Campaign description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Select email template'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Select target segment'), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: 'submit-create-campaign' }));

    await waitFor(() => {
      expect(mockCreateCampaign).toHaveBeenCalledWith({
        name: 'Test Campaign',
        description: 'Test Description',
        templateId: '1',
        targetAudience: {
          segment: '1',
        },
        schedule: {
          type: 'immediate',
        },
      });
      expect(screen.getByText('Campaign created successfully')).toBeInTheDocument();
    });
  });

  it('handles campaign deletion with confirmation', async () => {
    const mockDeleteCampaign = jest.fn().mockResolvedValue({});
    require('@/lib/api').deleteCampaign = mockDeleteCampaign;

    render(<CampaignCreator />);
    fireEvent.click(screen.getByRole('button', { name: 'open-create-campaign-modal' }));

    // Mock window.confirm
    const mockConfirm = jest.spyOn(window, 'confirm');
    mockConfirm.mockImplementation(() => true);

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(mockDeleteCampaign).toHaveBeenCalled();
      expect(screen.getByText('Campaign deleted successfully')).toBeInTheDocument();
    });

    mockConfirm.mockRestore();
  });
}); 