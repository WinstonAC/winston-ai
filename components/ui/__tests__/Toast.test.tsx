import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast', () => {
  it('renders with default props', () => {
    render(<Toast message="Test message" />);
    const toast = screen.getByText('Test message');
    expect(toast).toBeInTheDocument();
  });

  it('renders with different variants', () => {
    render(<Toast message="Test message" variant="success" />);
    const toast = screen.getByRole('alert').querySelector('div');
    expect(toast).toHaveClass('bg-green-500');
  });

  it('renders with different positions', () => {
    render(<Toast message="Test message" position="top-right" />);
    const toast = screen.getByRole('alert');
    expect(toast).toHaveClass('top-4 right-4');
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(<Toast message="Test message" onClose={handleClose} />);
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after duration', () => {
    jest.useFakeTimers();
    const handleClose = jest.fn();
    render(<Toast message="Test message" duration={1000} onClose={handleClose} />);
    jest.advanceTimersByTime(1000);
    expect(handleClose).toHaveBeenCalledTimes(1);
    jest.useRealTimers();
  });

  it('renders with custom className', () => {
    render(<Toast message="Test message" className="custom-class" />);
    const toast = screen.getByRole('alert').querySelector('div');
    expect(toast).toHaveClass('custom-class');
  });

  it('renders with icon', () => {
    const icon = <span>🔔</span>;
    render(<Toast message="Test message" icon={icon} />);
    const iconElement = screen.getByText('🔔');
    expect(iconElement).toBeInTheDocument();
  });
}); 