import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamPermissions } from '../TeamPermissions';
import { PermissionsProvider } from '../../contexts/PermissionsContext';
import { UserRole, TeamPermission } from '../../types/auth';

// Mock the fetch API
global.fetch = jest.fn();

const mockTeamMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: UserRole.ADMIN,
    permissions: [TeamPermission.READ, TeamPermission.WRITE],
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: UserRole.USER,
    permissions: [TeamPermission.READ],
  },
];

describe('TeamPermissions', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  const renderComponent = () => {
    return render(
      <PermissionsProvider>
        <TeamPermissions />
      </PermissionsProvider>
    );
  };

  it('renders loading state initially', () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      new Promise(() => {})
    );

    renderComponent();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('displays team members after loading', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTeamMembers),
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles form validation', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTeamMembers),
      })
    );

    renderComponent();

    // Open add member modal
    fireEvent.click(screen.getByText('Add Member'));

    // Try to submit empty form
    fireEvent.click(screen.getByText('Save'));

    // Check for validation errors
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Role is required')).toBeInTheDocument();
  });

  it('handles successful member creation', async () => {
    const newMember = {
      id: '3',
      name: 'New Member',
      email: 'new@example.com',
      role: UserRole.USER,
      permissions: [TeamPermission.READ],
    };

    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTeamMembers),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(newMember),
        })
      );

    renderComponent();

    // Open add member modal
    fireEvent.click(screen.getByText('Add Member'));

    // Fill in form
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: newMember.name },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: newMember.email },
    });
    fireEvent.change(screen.getByLabelText('Role'), {
      target: { value: newMember.role },
    });

    // Submit form
    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(screen.getByText(newMember.name)).toBeInTheDocument();
    });
  });

  it('handles member deletion', async () => {
    (global.fetch as jest.Mock)
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockTeamMembers),
        })
      )
      .mockImplementationOnce(() =>
        Promise.resolve({
          ok: true,
        })
      );

    // Mock window.confirm
    window.confirm = jest.fn(() => true);

    renderComponent();

    // Wait for members to load
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click delete button
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('API Error'))
    );

    renderComponent();

    // Check that error is logged
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch team members:',
        expect.any(Error)
      );
    });
  });
}); 