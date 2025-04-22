import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-black');
    expect(button).toHaveClass('text-white');
  });

  it('renders with variant prop', () => {
    render(<Button variant="outline">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('border-2');
    expect(button).toHaveClass('border-black');
  });

  it('renders with size prop', () => {
    render(<Button size="lg">Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveClass('text-lg');
    expect(button).toHaveClass('px-6');
    expect(button).toHaveClass('py-3');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders loading state', () => {
    render(<Button loading>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
  });

  it('renders disabled state', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50');
    expect(button).toHaveClass('cursor-not-allowed');
  });
}); 