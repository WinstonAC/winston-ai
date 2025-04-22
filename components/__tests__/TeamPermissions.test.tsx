import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TeamPermissions } from '../TeamPermissions';
import { useSession } from 'next-auth/react';
import { usePermissions } from '@/contexts/PermissionsContext';

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock PermissionsContext
jest.mock('@/contexts/PermissionsContext', () => ({
  usePermissions: jest.fn(),
}));

describe('TeamPermissions', () => {
  const mockTeamMembers = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'member' },
  ];

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: { user: { id: '1' } },
      status: 'authenticated',
    });

    (usePermissions as jest.Mock).mockReturnValue({
      state: { teamMembers: mockTeamMembers },
      dispatch: jest.fn(),
    });
  });

  it('displays team members after loading', async () => {
    await act(async () => {
      render(<TeamPermissions />);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('handles form validation', async () => {
    await act(async () => {
      render(<TeamPermissions />);
    });

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add member/i });
      fireEvent.click(addButton);
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Role is required')).toBeInTheDocument();
  });

  it('handles successful member creation', async () => {
    await act(async () => {
      render(<TeamPermissions />);
    });

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /add member/i });
      fireEvent.click(addButton);
    });

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'New Member' },
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'new@example.com' },
    });
    fireEvent.change(screen.getByLabelText('Role'), {
      target: { value: 'member' },
    });

    const saveButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New Member')).toBeInTheDocument();
    });
  });

  it('handles member deletion', async () => {
    await act(async () => {
      render(<TeamPermissions />);
    });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    const confirmButton = screen.getByRole('button', { name: /confirm/i });
    await act(async () => {
      fireEvent.click(confirmButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    (usePermissions as jest.Mock).mockReturnValue({
      state: { teamMembers: [], error: new Error('API Error') },
      dispatch: jest.fn(),
    });

    await act(async () => {
      render(<TeamPermissions />);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch team members:',
        expect.any(Error)
      );
    });

    consoleSpy.mockRestore();
  });
}); 