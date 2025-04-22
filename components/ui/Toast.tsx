import React, { useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export interface ToastProps {
  message: string;
  variant?: 'success' | 'error' | 'warning' | 'info';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  duration?: number;
  onClose?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'info',
  position = 'top-right',
  duration = 3000,
  onClose,
  className = '',
  icon,
}) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const variantClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500',
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  };

  return (
    <div
      className={`fixed ${positionClasses[position]} z-50`}
      role="alert"
    >
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg text-white ${variantClasses[variant]} ${className}`}
      >
        {icon && <div className="mr-2">{icon}</div>}
        <span className="flex-1">{message}</span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-2 text-white hover:text-gray-200 focus:outline-none"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}; 