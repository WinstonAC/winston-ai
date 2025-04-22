import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuth } from '@/hooks/useAuth';

// Mock the useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

describe('Login Component', () => {
  const mockLogin = jest.fn();
  
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      loading: false,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    mockLogin.mockResolvedValueOnce({ success: true });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error message on login failure', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpassword' },
    });
    
    fireEvent.click(screen.getByRole('button', { name: /login/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while loading', () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      loading: true,
    });
    
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
    
    expect(screen.getByRole('button', { name: /login/i })).toBeDisabled();
  });
}); 