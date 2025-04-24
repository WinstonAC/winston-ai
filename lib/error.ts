import { toast } from 'react-hot-toast';

export type ErrorType = 
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'network'
  | 'server'
  | 'unknown';

export interface AppError {
  type: ErrorType;
  message: string;
  code?: string;
  details?: any;
}

export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType = 'unknown',
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const handleError = (error: unknown): AppError => {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    // Handle specific error types
    if (error.name === 'ValidationError') {
      return new AppError(error.message, 'validation');
    }
    if (error.name === 'AuthenticationError') {
      return new AppError(error.message, 'authentication');
    }
    if (error.name === 'AuthorizationError') {
      return new AppError(error.message, 'authorization');
    }
    if (error.name === 'NetworkError') {
      return new AppError(error.message, 'network');
    }
    return new AppError(error.message);
  }

  return new AppError('An unexpected error occurred');
};

export const showErrorToast = (error: AppError) => {
  const messages = {
    validation: 'Please check your input and try again',
    authentication: 'Authentication failed. Please try again',
    authorization: 'You do not have permission to perform this action',
    network: 'Network error. Please check your connection',
    server: 'Server error. Please try again later',
    unknown: 'An unexpected error occurred'
  };

  toast.error(error.message || messages[error.type]);
};

export const logError = (error: AppError) => {
  console.error(`[${error.type}] ${error.message}`, error.details);
  // Here you would typically send the error to your error tracking service
  // Example: sendToErrorTrackingService(error);
}; 