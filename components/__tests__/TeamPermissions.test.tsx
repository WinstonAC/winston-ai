import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TeamPermissions } from '../TeamPermissions';
import { useSession } from 'next-auth/react';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

describe('TeamPermissions', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });
  });

  it('displays loading state initially', () => {
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
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<TeamPermissions />);
    expect(screen.getByText('Loading team...')).toBeInTheDocument();
  });
}); 