import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import LeadTable from '@/components/LeadTable';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/lib/api');
jest.mock('react-hot-toast');

describe('LeadTable', () => {
  const mockLeads = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Acme Inc',
      status: 'new',
      source: 'linkedin',
      lastContact: '2024-03-20T10:00:00Z',
      score: 85
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      company: 'Tech Corp',
      status: 'contacted',
      source: 'website',
      lastContact: '2024-03-19T15:30:00Z',
      score: 92
    }
  ];

  const mockUser = {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'admin'
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false
    });

    (api.getLeads as jest.Mock).mockResolvedValue({
      leads: mockLeads,
      total: mockLeads.length
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the lead table with data', async () => {
    render(<LeadTable />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    });

    // Check table headers
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Score')).toBeInTheDocument();
  });

  it('handles sorting', async () => {
    const user = userEvent.setup();
    render(<LeadTable />);

    // Sort by name
    await user.click(screen.getByText('Name'));
    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: 'name',
      sortOrder: 'asc'
    }));

    // Sort by name in descending order
    await user.click(screen.getByText('Name'));
    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: 'name',
      sortOrder: 'desc'
    }));
  });

  it('handles filtering', async () => {
    const user = userEvent.setup();
    render(<LeadTable />);

    // Open filter menu
    await user.click(screen.getByTestId('filter-button'));
    
    // Set status filter
    await user.click(screen.getByText('Status'));
    await user.click(screen.getByText('New'));
    
    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      filters: expect.objectContaining({
        status: 'new'
      })
    }));

    // Set score range filter
    const minScore = screen.getByLabelText('Minimum Score');
    const maxScore = screen.getByLabelText('Maximum Score');
    await user.type(minScore, '80');
    await user.type(maxScore, '95');

    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      filters: expect.objectContaining({
        scoreRange: { min: 80, max: 95 }
      })
    }));
  });

  it('handles pagination', async () => {
    const user = userEvent.setup();
    render(<LeadTable />);

    // Go to next page
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      page: 2
    }));

    // Change page size
    await user.click(screen.getByRole('button', { name: /rows per page/i }));
    await user.click(screen.getByText('50'));
    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      pageSize: 50
    }));
  });

  it('handles lead selection and bulk actions', async () => {
    const user = userEvent.setup();
    render(<LeadTable />);

    // Select leads
    await user.click(screen.getByTestId('select-lead-1'));
    await user.click(screen.getByTestId('select-lead-2'));

    // Open bulk actions menu
    await user.click(screen.getByRole('button', { name: /bulk actions/i }));

    // Update status
    await user.click(screen.getByText('Update Status'));
    await user.click(screen.getByText('Qualified'));

    expect(api.updateLeads).toHaveBeenCalledWith(['1', '2'], {
      status: 'qualified'
    });
    expect(toast.success).toHaveBeenCalledWith('Successfully updated 2 leads');
  });

  it('handles lead editing', async () => {
    const user = userEvent.setup();
    render(<LeadTable />);

    // Open edit modal
    await user.click(screen.getByTestId('edit-lead-1'));

    // Update lead details
    await user.type(screen.getByLabelText('Name'), ' Jr.');
    await user.type(screen.getByLabelText('Company'), ' (Updated)');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(api.updateLead).toHaveBeenCalledWith('1', {
      name: 'John Doe Jr.',
      company: 'Acme Inc (Updated)'
    });
    expect(toast.success).toHaveBeenCalledWith('Lead updated successfully');
  });

  it('handles lead deletion', async () => {
    const user = userEvent.setup();
    render(<LeadTable />);

    // Open delete confirmation
    await user.click(screen.getByTestId('delete-lead-1'));
    
    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(api.deleteLead).toHaveBeenCalledWith('1');
    expect(toast.success).toHaveBeenCalledWith('Lead deleted successfully');
  });

  it('handles lead export', async () => {
    const user = userEvent.setup();
    render(<LeadTable />);

    // Open export modal
    await user.click(screen.getByRole('button', { name: /export/i }));

    // Select export format
    await user.click(screen.getByLabelText('CSV'));
    
    // Select fields to export
    await user.click(screen.getByLabelText('Name'));
    await user.click(screen.getByLabelText('Email'));
    await user.click(screen.getByLabelText('Company'));

    // Start export
    await user.click(screen.getByRole('button', { name: /export selected/i }));

    expect(api.exportLeads).toHaveBeenCalledWith({
      format: 'csv',
      fields: ['name', 'email', 'company']
    });
    expect(toast.success).toHaveBeenCalledWith('Export started. You will be notified when it\'s ready.');
  });

  it('handles lead import', async () => {
    const user = userEvent.setup();
    render(<LeadTable />);

    // Open import modal
    await user.click(screen.getByRole('button', { name: /import/i }));

    // Upload file
    const file = new File(['test data'], 'leads.csv', { type: 'text/csv' });
    const input = screen.getByTestId('file-upload');
    await user.upload(input, file);

    // Map fields
    await user.click(screen.getByText('Map Fields'));
    await user.selectOptions(screen.getByLabelText('Name Column'), 'Full Name');
    await user.selectOptions(screen.getByLabelText('Email Column'), 'Email Address');

    // Start import
    await user.click(screen.getByRole('button', { name: /start import/i }));

    expect(api.importLeads).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith('Import started. You will be notified when it\'s complete.');
  });

  it('handles search', async () => {
    const user = userEvent.setup();
    render(<LeadTable />);

    // Perform search
    const searchInput = screen.getByRole('textbox', { name: /search leads/i });
    await user.type(searchInput, 'john');

    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      search: 'john'
    }));
  });

  it('handles error states', async () => {
    (api.getLeads as jest.Mock).mockRejectedValue(new Error('Failed to fetch leads'));
    render(<LeadTable />);

    await waitFor(() => {
      expect(screen.getByText(/error loading leads/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    // Test retry functionality
    await userEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(api.getLeads).toHaveBeenCalledTimes(2);
  });

  it('handles empty state', async () => {
    (api.getLeads as jest.Mock).mockResolvedValue({
      leads: [],
      total: 0
    });

    render(<LeadTable />);

    await waitFor(() => {
      expect(screen.getByText(/no leads found/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add lead/i })).toBeInTheDocument();
    });
  });

  it('handles loading state', () => {
    (api.getLeads as jest.Mock).mockImplementation(() => new Promise(() => {}));
    render(<LeadTable />);

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
}); 