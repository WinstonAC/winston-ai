import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'react-hot-toast';
import LeadManagement from '@/components/LeadManagement';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

// Mock dependencies
jest.mock('@/hooks/useAuth');
jest.mock('@/lib/api');
jest.mock('react-hot-toast');

describe('LeadManagement', () => {
  const mockLeads = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      company: 'Acme Inc',
      status: 'active',
      lastContactDate: '2024-03-20T10:00:00Z',
      tags: ['enterprise', 'sales-qualified']
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      company: 'Tech Corp',
      status: 'pending',
      lastContactDate: '2024-03-19T15:30:00Z',
      tags: ['startup', 'marketing-qualified']
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

  it('renders the lead management interface', async () => {
    render(<LeadManagement />);
    
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /leads/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add lead/i })).toBeInTheDocument();
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });
  });

  it('displays lead data in a table', async () => {
    render(<LeadManagement />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
      expect(screen.getByText('Acme Inc')).toBeInTheDocument();
    });
  });

  it('handles lead creation', async () => {
    const user = userEvent.setup();
    (api.createLead as jest.Mock).mockResolvedValue({
      id: '3',
      name: 'New Lead',
      email: 'new@example.com',
      company: 'New Corp',
      status: 'active',
      tags: []
    });

    render(<LeadManagement />);

    // Open create modal
    await user.click(screen.getByRole('button', { name: /add lead/i }));

    // Fill form
    await user.type(screen.getByLabelText(/name/i), 'New Lead');
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');
    await user.type(screen.getByLabelText(/company/i), 'New Corp');
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(api.createLead).toHaveBeenCalledWith({
      name: 'New Lead',
      email: 'new@example.com',
      company: 'New Corp',
      status: 'active'
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Lead created successfully');
    });
  });

  it('handles lead editing', async () => {
    const user = userEvent.setup();
    (api.updateLead as jest.Mock).mockResolvedValue({
      ...mockLeads[0],
      name: 'Updated Name'
    });

    render(<LeadManagement />);

    // Wait for table to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click edit button
    await user.click(screen.getByTestId(`edit-lead-${mockLeads[0].id}`));

    // Update name
    const nameInput = screen.getByLabelText(/name/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Name');

    // Save changes
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(api.updateLead).toHaveBeenCalledWith(mockLeads[0].id, {
      ...mockLeads[0],
      name: 'Updated Name'
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Lead updated successfully');
    });
  });

  it('handles lead deletion', async () => {
    const user = userEvent.setup();
    (api.deleteLead as jest.Mock).mockResolvedValue({ success: true });

    render(<LeadManagement />);

    // Wait for table to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click delete button
    await user.click(screen.getByTestId(`delete-lead-${mockLeads[0].id}`));

    // Confirm deletion
    await user.click(screen.getByRole('button', { name: /confirm/i }));

    expect(api.deleteLead).toHaveBeenCalledWith(mockLeads[0].id);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Lead deleted successfully');
    });
  });

  it('handles search and filtering', async () => {
    const user = userEvent.setup();
    render(<LeadManagement />);

    const searchInput = screen.getByRole('searchbox');
    await user.type(searchInput, 'John');

    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      search: 'John'
    }));
  });

  it('handles pagination', async () => {
    const user = userEvent.setup();
    render(<LeadManagement />);

    // Click next page
    await user.click(screen.getByRole('button', { name: /next/i }));

    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      page: 2
    }));
  });

  it('handles tag filtering', async () => {
    const user = userEvent.setup();
    render(<LeadManagement />);

    // Open tag filter
    await user.click(screen.getByRole('button', { name: /filter by tags/i }));

    // Select tag
    await user.click(screen.getByRole('checkbox', { name: /enterprise/i }));

    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      tags: ['enterprise']
    }));
  });

  it('handles status filtering', async () => {
    const user = userEvent.setup();
    render(<LeadManagement />);

    // Open status filter
    await user.click(screen.getByRole('button', { name: /filter by status/i }));

    // Select status
    await user.click(screen.getByRole('radio', { name: /active/i }));

    expect(api.getLeads).toHaveBeenCalledWith(expect.objectContaining({
      status: 'active'
    }));
  });

  it('handles bulk actions', async () => {
    const user = userEvent.setup();
    (api.updateLeads as jest.Mock).mockResolvedValue({ success: true });

    render(<LeadManagement />);

    // Select leads
    await user.click(screen.getByTestId(`select-lead-${mockLeads[0].id}`));
    await user.click(screen.getByTestId(`select-lead-${mockLeads[1].id}`));

    // Open bulk actions
    await user.click(screen.getByRole('button', { name: /bulk actions/i }));

    // Update status
    await user.click(screen.getByRole('menuitem', { name: /mark as active/i }));

    expect(api.updateLeads).toHaveBeenCalledWith({
      ids: [mockLeads[0].id, mockLeads[1].id],
      status: 'active'
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Leads updated successfully');
    });
  });

  it('handles error states', async () => {
    (api.getLeads as jest.Mock).mockRejectedValue(new Error('Failed to fetch leads'));

    render(<LeadManagement />);

    await waitFor(() => {
      expect(screen.getByText(/error loading leads/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('handles empty states', async () => {
    (api.getLeads as jest.Mock).mockResolvedValue({
      leads: [],
      total: 0
    });

    render(<LeadManagement />);

    await waitFor(() => {
      expect(screen.getByText(/no leads found/i)).toBeInTheDocument();
    });
  });
}); 