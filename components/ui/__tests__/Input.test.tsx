import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from '../Input';

describe('Input', () => {
  it('renders with default props', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Test Label" />);
    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
  });

  it('renders with error message', () => {
    render(<Input error="Test Error" />);
    const error = screen.getByText('Test Error');
    expect(error).toBeInTheDocument();
  });

  it('handles onChange event', () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(<Input className="custom-class" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('renders with different variants', () => {
    render(<Input variant="error" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
  });

  it('renders with different sizes', () => {
    render(<Input size="lg" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('text-lg');
  });

  it('renders with prefix', () => {
    render(<Input prefix="$" />);
    const prefix = screen.getByText('$');
    expect(prefix).toBeInTheDocument();
  });

  it('renders with suffix', () => {
    render(<Input suffix="USD" />);
    const suffix = screen.getByText('USD');
    expect(suffix).toBeInTheDocument();
  });
}); 