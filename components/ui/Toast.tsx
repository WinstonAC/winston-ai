import React, { useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="w-6 h-6" />;
      case 'error':
        return <ExclamationCircleIcon className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      default:
        return 'border-black';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-black';
    }
  };

  return (
    <div
      className={`fixed bottom-4 right-4 bg-white border-2 ${getBorderColor()} p-4 flex items-center gap-2 animate-in slide-in-from-bottom`}
      role="alert"
    >
      {getIcon()}
      <span className={`font-bold ${getTextColor()}`}>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black hover:text-white transition-colors"
        aria-label="Close notification"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </div>
  );
}; 