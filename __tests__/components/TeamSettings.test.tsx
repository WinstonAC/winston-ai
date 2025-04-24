import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TeamSettings } from '../../components/TeamSettings';
import { usePermissions } from '../../contexts/PermissionsContext';
import { toast } from 'react-hot-toast';

// Mock dependencies
jest.mock('../../contexts/PermissionsContext');
jest.mock('react-hot-toast');
jest.mock('@stripe/stripe-js');

// Mock data
const mockTeam = {
  id: '1',
  name: 'Marketing Team',
  plan: 'professional',
  seats: 10,
  usedSeats: 7,
  owner: {
    id: '1',
    email: 'owner@example.com',
    name: 'Team Owner'
  },
  members: [
    {
      id: '2',
      email: 'member1@example.com',
      name: 'Team Member 1',
      role: 'admin'
    },
    {
      id: '3',
      email: 'member2@example.com',
      name: 'Team Member 2',
      role: 'member'
    }
  ],
  pendingInvites: [
    {
      id: '1',
      email: 'pending@example.com',
      role: 'member',
      expiresAt: '2024-04-15T10:00:00Z'
    }
  ],
  settings: {
    allowGuestAccess: true,
    requireMfa: true,
    defaultRole: 'member'
  },
  billing: {
    status: 'active',
    nextBillingDate: '2024-04-01',
    amount: 99.99
  }
};

describe('TeamSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock permissions
    (usePermissions as jest.Mock).mockReturnValue({
      checkPermission: (permission: string) => {
        const permissions = {
          canManageTeam: true,
          canManageRoles: true,
          canManageBilling: true,
          canInviteMembers: true
        };
        return permissions[permission] ?? false;
      }
    });

    // Mock fetch
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ team: mockTeam })
    });
  });

  it('renders without crashing', () => {
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={() => {}}
      />
    );
    expect(screen.getByTestId('team-settings')).toBeInTheDocument();
  });

  it('displays team information correctly', () => {
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={() => {}}
      />
    );

    expect(screen.getByText('Marketing Team')).toBeInTheDocument();
    expect(screen.getByText('Professional Plan')).toBeInTheDocument();
    expect(screen.getByText('7/10 seats used')).toBeInTheDocument();
  });

  it('handles team name updates', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={onUpdate}
      />
    );

    // Click edit button
    const editButton = screen.getByTitle(/Edit team name/i);
    await user.click(editButton);

    // Update name
    const nameInput = screen.getByDisplayValue('Marketing Team');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Team Name');

    // Save changes
    const saveButton = screen.getByText(/Save/i);
    await user.click(saveButton);

    // Verify update
    expect(onUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Team Name'
      })
    );
  });

  it('handles member role changes', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={onUpdate}
      />
    );

    // Open role dropdown
    const roleSelect = screen.getAllByRole('combobox', { name: /Role/i })[0];
    await user.click(roleSelect);

    // Select new role
    const adminOption = screen.getByText(/Admin/i);
    await user.click(adminOption);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/teams/1/members/2/role', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' })
    });
  });

  it('handles member removal', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={onUpdate}
      />
    );

    // Click remove button
    const removeButton = screen.getAllByTitle(/Remove member/i)[0];
    await user.click(removeButton);

    // Confirm removal
    const confirmButton = screen.getByText(/Confirm/i);
    await user.click(confirmButton);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/teams/1/members/2', {
      method: 'DELETE'
    });
  });

  it('handles member invitations', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={onUpdate}
      />
    );

    // Click invite button
    const inviteButton = screen.getByText(/Invite Member/i);
    await user.click(inviteButton);

    // Fill in email
    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'newmember@example.com');

    // Select role
    const roleSelect = screen.getByLabelText(/Role/i);
    await user.selectOptions(roleSelect, 'member');

    // Send invitation
    const sendButton = screen.getByText(/Send Invitation/i);
    await user.click(sendButton);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/teams/1/invites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newmember@example.com',
        role: 'member'
      })
    });
  });

  it('handles invitation cancellation', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={onUpdate}
      />
    );

    // Click cancel button
    const cancelButton = screen.getByTitle(/Cancel invitation/i);
    await user.click(cancelButton);

    // Confirm cancellation
    const confirmButton = screen.getByText(/Confirm/i);
    await user.click(confirmButton);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/teams/1/invites/1', {
      method: 'DELETE'
    });
  });

  it('handles plan upgrades', async () => {
    const user = userEvent.setup();
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={() => {}}
      />
    );

    // Click upgrade button
    const upgradeButton = screen.getByText(/Upgrade Plan/i);
    await user.click(upgradeButton);

    // Select enterprise plan
    const enterprisePlan = screen.getByText(/Enterprise/i);
    await user.click(enterprisePlan);

    // Verify Stripe checkout was initiated
    expect(global.fetch).toHaveBeenCalledWith('/api/billing/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan: 'enterprise' })
    });
  });

  it('handles seat management', async () => {
    const user = userEvent.setup();
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={() => {}}
      />
    );

    // Click manage seats button
    const manageButton = screen.getByText(/Manage Seats/i);
    await user.click(manageButton);

    // Add seats
    const addButton = screen.getByText(/Add Seats/i);
    await user.click(addButton);

    // Enter number of seats
    const seatsInput = screen.getByLabelText(/Number of seats/i);
    await user.type(seatsInput, '5');

    // Confirm addition
    const confirmButton = screen.getByText(/Confirm/i);
    await user.click(confirmButton);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/teams/1/seats', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seats: 5 })
    });
  });

  it('handles security settings updates', async () => {
    const user = userEvent.setup();
    const onUpdate = jest.fn();
    
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={onUpdate}
      />
    );

    // Toggle MFA requirement
    const mfaToggle = screen.getByRole('switch', { name: /Require MFA/i });
    await user.click(mfaToggle);

    // Toggle guest access
    const guestToggle = screen.getByRole('switch', { name: /Allow Guest Access/i });
    await user.click(guestToggle);

    // Save changes
    const saveButton = screen.getByText(/Save Security Settings/i);
    await user.click(saveButton);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/teams/1/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        requireMfa: false,
        allowGuestAccess: false
      })
    });
  });

  it('handles billing information display', async () => {
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={() => {}}
      />
    );

    expect(screen.getByText(/Next billing date:/i)).toBeInTheDocument();
    expect(screen.getByText('April 1, 2024')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('handles error states', async () => {
    // Mock fetch to return an error
    global.fetch = jest.fn().mockRejectedValue(new Error('Failed to update team'));

    const user = userEvent.setup();
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={() => {}}
      />
    );

    // Try to update team name
    const editButton = screen.getByTitle(/Edit team name/i);
    await user.click(editButton);
    const nameInput = screen.getByDisplayValue('Marketing Team');
    await user.clear(nameInput);
    await user.type(nameInput, 'New Team Name');
    const saveButton = screen.getByText(/Save/i);
    await user.click(saveButton);

    // Verify error message
    expect(screen.getByText(/Failed to update team/i)).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Failed to update team');
  });

  it('respects user permissions', () => {
    // Mock permissions to be false
    (usePermissions as jest.Mock).mockReturnValue({
      checkPermission: () => false
    });

    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={() => {}}
      />
    );

    // Verify restricted actions are not available
    expect(screen.queryByText(/Invite Member/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Upgrade Plan/i)).not.toBeInTheDocument();
    expect(screen.queryByTitle(/Edit team name/i)).not.toBeInTheDocument();
  });

  it('handles billing cancellation', async () => {
    const user = userEvent.setup();
    render(
      <TeamSettings
        team={mockTeam}
        onUpdate={() => {}}
      />
    );

    // Click cancel subscription button
    const cancelButton = screen.getByText(/Cancel Subscription/i);
    await user.click(cancelButton);

    // Confirm cancellation
    const confirmButton = screen.getByText(/Confirm Cancellation/i);
    await user.click(confirmButton);

    // Verify API call
    expect(global.fetch).toHaveBeenCalledWith('/api/billing/cancel', {
      method: 'POST'
    });
  });
}); 