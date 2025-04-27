import React from 'react';
import toast from 'react-hot-toast';

interface ToastProps {
  position?: 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export const Toast: React.FC<ToastProps> = ({ position = 'top-right' }) => {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'fixed',
        ...(position.includes('top') ? { top: '1rem' } : { bottom: '1rem' }),
        ...(position.includes('right') ? { right: '1rem' } : {}),
        ...(position.includes('left') ? { left: '1rem' } : {}),
        ...(position.includes('center') ? { left: '50%', transform: 'translateX(-50%)' } : {}),
      }}
    />
  );
};

export default toast; 