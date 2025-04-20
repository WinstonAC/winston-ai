import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Modal from '../Modal';

describe('Modal', () => {
  it('renders with default props', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Test Modal" />);
    const modal = screen.getByText('Test Modal');
    expect(modal).toBeInTheDocument();
  });

  it('renders with children', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );
    const content = screen.getByText('Modal Content');
    expect(content).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(<Modal isOpen={true} onClose={handleClose} title="Test Modal" />);
    const closeButton = screen.getByRole('button');
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', () => {
    const handleClose = jest.fn();
    render(<Modal isOpen={true} onClose={handleClose} title="Test Modal" />);
    const backdrop = screen.getByTestId('modal-backdrop');
    fireEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders with custom className', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Test Modal" className="custom-class" />);
    const modal = screen.getByTestId('modal-content');
    expect(modal).toHaveClass('custom-class');
  });

  it('renders with different sizes', () => {
    render(<Modal isOpen={true} onClose={() => {}} title="Test Modal" size="lg" />);
    const modal = screen.getByTestId('modal-content');
    expect(modal).toHaveClass('max-w-2xl');
  });

  it('renders with footer', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" footer={<div>Footer Content</div>} />
    );
    const footer = screen.getByText('Footer Content');
    expect(footer).toBeInTheDocument();
  });
}); 