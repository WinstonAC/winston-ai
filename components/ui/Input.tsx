import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const inputVariants = cva(
  'w-full p-2 border-2 bg-white text-black focus:outline-none focus:ring-2 focus:ring-black',
  {
    variants: {
      variant: {
        default: 'border-black',
        error: 'border-red-500',
        success: 'border-green-500',
      },
      size: {
        sm: 'text-sm px-2 py-1',
        md: 'text-base px-3 py-2',
        lg: 'text-lg px-4 py-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, size, label, error, leftIcon, rightIcon, startAdornment, endAdornment, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-bold">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              {leftIcon}
            </div>
          )}
          {startAdornment && (
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500">
              {startAdornment}
            </div>
          )}
          <input
            className={cn(
              inputVariants({ variant, size }),
              startAdornment && 'pl-6',
              endAdornment && 'pr-6',
              className
            )}
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500">
              {endAdornment}
            </div>
          )}
          {rightIcon && (
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-red-500 text-sm font-bold flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input }; 