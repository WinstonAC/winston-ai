import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TeamManagement from '../TeamManagement'

// Mock the API calls
jest.mock('@/lib/api', () => ({
  getTeamMembers: jest.fn(),
  inviteTeamMember: jest.fn(),
  updateTeamMember: jest.fn(),
  removeTeamMember: jest.fn(),
  updateTeamSettings: jest.fn(),
}))

describe('TeamManagement Component', () => {
  const mockTeamMembers = [
    { id: '1', email: 'user1@example.com', role: 'admin' },
    { id: '2', email: 'user2@example.com', role: 'member' },
  ]

  const mockTeamSettings = {
    name: 'Test Team',
    emailDomain: 'example.com',
    maxMembers: 10,
    allowMemberInvites: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    // Setup default mock implementations
    const api = require('@/lib/api')
    api.getTeamMembers.mockResolvedValue(mockTeamMembers)
    api.getTeamSettings.mockResolvedValue(mockTeamSettings)
  })

  it('renders team management interface', async () => {
    render(<TeamManagement />)
    
    // Wait for the component to load
    await waitFor(() => {
      expect(screen.getByText('Team Settings')).toBeInTheDocument()
      expect(screen.getByText('Invite Team Member')).toBeInTheDocument()
      expect(screen.getByText('Team Members')).toBeInTheDocument()
    })
  })

  it('displays current team members', async () => {
    render(<TeamManagement />)
    
    await waitFor(() => {
      mockTeamMembers.forEach(member => {
        expect(screen.getByText(member.email)).toBeInTheDocument()
        expect(screen.getByText(member.role)).toBeInTheDocument()
      })
    })
  })

  it('handles team member invitation', async () => {
    const api = require('@/lib/api')
    api.inviteTeamMember.mockResolvedValueOnce({ success: true })
    
    render(<TeamManagement />)
    
    // Fill in the invite form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'newuser@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/role/i), {
      target: { value: 'member' },
    })
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /invite/i }))
    
    await waitFor(() => {
      expect(api.inviteTeamMember).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        role: 'member',
      })
    })
  })

  it('handles team settings update', async () => {
    const api = require('@/lib/api')
    api.updateTeamSettings.mockResolvedValueOnce({ success: true })
    
    render(<TeamManagement />)
    
    // Update team settings
    fireEvent.change(screen.getByLabelText(/team name/i), {
      target: { value: 'Updated Team Name' },
    })
    fireEvent.change(screen.getByLabelText(/email domain/i), {
      target: { value: 'updated.com' },
    })
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /save settings/i }))
    
    await waitFor(() => {
      expect(api.updateTeamSettings).toHaveBeenCalledWith({
        name: 'Updated Team Name',
        emailDomain: 'updated.com',
        maxMembers: mockTeamSettings.maxMembers,
        allowMemberInvites: mockTeamSettings.allowMemberInvites,
      })
    })
  })

  it('handles team member role update', async () => {
    const api = require('@/lib/api')
    api.updateTeamMember.mockResolvedValueOnce({ success: true })
    
    render(<TeamManagement />)
    
    await waitFor(() => {
      // Find the role select for the first team member
      const roleSelect = screen.getAllByLabelText(/role/i)[0]
      fireEvent.change(roleSelect, {
        target: { value: 'admin' },
      })
      
      expect(api.updateTeamMember).toHaveBeenCalledWith(mockTeamMembers[0].id, {
        role: 'admin',
      })
    })
  })

  it('handles team member removal', async () => {
    const api = require('@/lib/api')
    api.removeTeamMember.mockResolvedValueOnce({ success: true })
    
    render(<TeamManagement />)
    
    await waitFor(() => {
      // Find and click the remove button for the first team member
      const removeButtons = screen.getAllByRole('button', { name: /remove/i })
      fireEvent.click(removeButtons[0])
      
      // Confirm removal in the confirmation dialog
      fireEvent.click(screen.getByRole('button', { name: /confirm/i }))
      
      expect(api.removeTeamMember).toHaveBeenCalledWith(mockTeamMembers[0].id)
    })
  })

  it('displays error messages when API calls fail', async () => {
    const api = require('@/lib/api')
    const errorMessage = 'Failed to update team settings'
    api.updateTeamSettings.mockRejectedValueOnce(new Error(errorMessage))
    
    render(<TeamManagement />)
    
    // Attempt to update team settings
    fireEvent.change(screen.getByLabelText(/team name/i), {
      target: { value: 'New Name' },
    })
    fireEvent.click(screen.getByRole('button', { name: /save settings/i }))
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
  })
}) 