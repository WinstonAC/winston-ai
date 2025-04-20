import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useRouter } from 'next/router'
import { useAuth } from '@/contexts/AuthContext'
import Login from '../Login'

// Mock the next/router
jest.mock('next/router', () => ({
  useRouter: jest.fn(),
}))

// Mock the AuthContext
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}))

describe('Login Component', () => {
  const mockLogin = jest.fn()
  const mockRouter = {
    push: jest.fn(),
  }

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
    
    // Setup default mock implementations
    ;(useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
    })
    ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
  })

  it('renders login form', () => {
    render(<Login />)
    
    // Check if all form elements are present
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('handles successful login', async () => {
    mockLogin.mockResolvedValueOnce(undefined)
    
    render(<Login />)
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Wait for the login function to be called
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123')
    })
    
    // Check if router.push was called with the dashboard path
    expect(mockRouter.push).toHaveBeenCalledWith('/dashboard')
  })

  it('displays error message on login failure', async () => {
    const errorMessage = 'Invalid credentials'
    mockLogin.mockRejectedValueOnce(new Error(errorMessage))
    
    render(<Login />)
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    })
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument()
    })
    
    // Check that router.push was not called
    expect(mockRouter.push).not.toHaveBeenCalled()
  })

  it('disables submit button while loading', async () => {
    mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<Login />)
    
    // Fill in the form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    fireEvent.click(submitButton)
    
    // Check if button is disabled and shows loading state
    expect(submitButton).toBeDisabled()
    expect(screen.getByText(/signing in/i)).toBeInTheDocument()
    
    // Wait for the login process to complete
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
      expect(screen.queryByText(/signing in/i)).not.toBeInTheDocument()
    })
  })
}) 