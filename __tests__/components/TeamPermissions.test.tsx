import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamPermissions } from '@/components/TeamPermissions';

// Mock useAuth
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock PermissionsContext
jest.mock('@/contexts/PermissionsContext', () => ({
  usePermissions: () => ({
    state: { permissions: [] },
    dispatch: jest.fn(),
  }),
}));

// Mock fetch
global.fetch = jest.fn();

describe('TeamPermissions', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock useAuth to return a logged-in user
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    // Mock fetch responses
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('/api/team/members')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([
            {
              id: 'user-1',
              name: 'Test User',
              email: 'test@example.com',
              role: 'admin',
              permissions: ['read', 'write'],
            },
            {
              id: 'user-2',
              name: 'Another User',
              email: 'another@example.com',
              role: 'member',
              permissions: ['read'],
            },
          ]),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  });

  it('renders team members list', async () => {
    render(<TeamPermissions />);
    
    await waitFor(() => {
      expect(screen.getByText('Team Members')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    render(<TeamPermissions />);
    expect(screen.getByText('Loading team...')).toBeInTheDocument();
  });

  it('displays team members when loaded', async () => {
    // Mock the fetch response
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'OWNER',
        },
      ]),
    });

    render(<TeamPermissions />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('handles role updates', async () => {
    // Mock the fetch responses
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'OWNER',
          },
        ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    render(<TeamPermissions />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click the role select
    const roleSelect = screen.getByRole('combobox');
    fireEvent.change(roleSelect, { target: { value: 'ADMIN' } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/team/members/1/role'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ role: 'ADMIN' }),
        })
      );
    });
  });

  it('handles member removal', async () => {
    // Mock the fetch responses
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'OWNER',
          },
        ]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    render(<TeamPermissions />);
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Find and click the remove button
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/team/members/1'),
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  it('handles member invitations', async () => {
    // Mock the fetch responses
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    render(<TeamPermissions />);

    // Fill out the invitation form
    const emailInput = screen.getByPlaceholderText('Enter email address');
    const roleSelect = screen.getByRole('combobox', { name: /role/i });
    const inviteButton = screen.getByRole('button', { name: /invite/i });

    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    fireEvent.change(roleSelect, { target: { value: 'MEMBER' } });
    fireEvent.click(inviteButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/team/invite'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({
            email: 'new@example.com',
            role: 'MEMBER',
          }),
        })
      );
    });
  });
}); 
}); 