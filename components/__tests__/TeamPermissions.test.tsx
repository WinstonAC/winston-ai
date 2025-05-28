import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '@/contexts/AuthContext';
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

describe('TeamPermissions', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
  };

  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      loading: false,
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
  });

  it('renders team members heading', () => {
    render(<TeamPermissions />);
    expect(screen.getByText('Team Members')).toBeInTheDocument();
  });

  it('shows loading state when user is loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: true,
    });

    render(<TeamPermissions />);
    expect(screen.getByText('Loading team...')).toBeInTheDocument();
  });

  it('displays team members after loading', async () => {
    const mockMembers = [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMembers),
    });

    render(<TeamPermissions />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays error message when fetch fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<TeamPermissions />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch team members')).toBeInTheDocument();
    });
  });

  it('handles unauthorized state', () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<TeamPermissions />);
    expect(screen.getByText('Loading team...')).toBeInTheDocument();
  });
}); 