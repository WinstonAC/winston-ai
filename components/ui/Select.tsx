import React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options = [], ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-200 mb-1">
            {label}
          </label>
        )}
        <select
          className={cn(
            'block w-full rounded-lg border bg-black text-white px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
            'disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-700 hover:border-gray-600',
            className
          )}
          ref={ref}
          {...props}
        >
          <option value="">Select an option</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select'; 