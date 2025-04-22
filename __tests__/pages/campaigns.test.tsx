import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import { Campaigns } from '@/pages/campaigns';
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

// Mock fetch
global.fetch = jest.fn();

describe('Campaigns', () => {
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

  const mockCampaigns = [
    {
      id: '1',
      name: 'Test Campaign',
      description: 'Test Description',
      status: 'draft',
      templateId: '1',
      targetAudience: {
        segment: '1',
        filters: {},
      },
      schedule: {
        type: 'immediate',
      },
    },
  ];

  const mockTemplates = [
    { id: '1', name: 'Welcome Email', subject: 'Welcome!' },
  ];

  const mockSegments = [
    { id: '1', name: 'All Leads' },
  ];

  const mockLeads = [
    { id: '1', name: 'John Doe', email: 'john@example.com', company: 'Acme Inc', title: 'CEO', status: 'new' },
  ];

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue(mockSession);
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (global.fetch as jest.Mock).mockImplementation((url) => {
      switch (url) {
        case '/api/campaigns':
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockCampaigns),
          });
        case '/api/templates':
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockTemplates),
          });
        case '/api/segments':
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockSegments),
          });
        case '/api/leads':
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve(mockLeads),
          });
        default:
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve([]),
          });
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component and fetches data', async () => {
    await act(async () => {
      render(<Campaigns />);
    });

    await waitFor(() => {
      expect(screen.getByText('EMAIL_CAMPAIGNS_')).toBeInTheDocument();
      expect(screen.getByText('Test Campaign')).toBeInTheDocument();
    });
  });

  it('creates a new campaign', async () => {
    render(<Campaigns />);
    
    // Click create campaign button
    const createButton = screen.getByRole('button', { name: 'open-create-campaign-modal' });
    fireEvent.click(createButton);

    // Fill in form fields
    fireEvent.change(screen.getByLabelText('Campaign name'), { target: { value: 'Test Campaign' } });
    fireEvent.change(screen.getByLabelText('Campaign description'), { target: { value: 'Test Description' } });
    fireEvent.change(screen.getByLabelText('Select email template'), { target: { value: 'template1' } });
    fireEvent.change(screen.getByLabelText('Select target segment'), { target: { value: 'segment1' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'submit-create-campaign' });
    fireEvent.click(submitButton);

    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Campaign created successfully')).toBeInTheDocument();
    });
  });

  it('updates a campaign', async () => {
    render(<Campaigns />);

    // Click edit button
    const editButton = screen.getByRole('button', { name: 'edit-campaign' });
    fireEvent.click(editButton);

    // Update form fields
    fireEvent.change(screen.getByLabelText('Campaign name'), { target: { value: 'Updated Campaign' } });
    fireEvent.change(screen.getByLabelText('Campaign description'), { target: { value: 'Updated Description' } });

    // Submit form
    const submitButton = screen.getByRole('button', { name: 'submit-update-campaign' });
    fireEvent.click(submitButton);

    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Campaign updated successfully')).toBeInTheDocument();
    });
  });

  it('deletes a campaign', async () => {
    render(<Campaigns />);

    // Click delete button
    const deleteButton = screen.getByRole('button', { name: 'delete-campaign' });
    fireEvent.click(deleteButton);

    // Confirm deletion
    const confirmButton = screen.getByRole('button', { name: 'confirm-delete' });
    fireEvent.click(confirmButton);

    // Check success message
    await waitFor(() => {
      expect(screen.getByText('Campaign deleted successfully')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    // Mock a failed API request
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    );

    await act(async () => {
      render(<Campaigns />);
    });

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });
}); 