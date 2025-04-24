import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TeamPermissions } from '../components/TeamPermissions';
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

// Mock toast
jest.mock('react-hot-toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe('TeamPermissions', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock useSession to return a logged-in user
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });

    // Mock useRouter
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
  });

  it('renders the component', () => {
    render(<TeamPermissions />);
    expect(screen.getByText('Team Members')).toBeInTheDocument();
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