import toast from 'react-hot-toast';

export type ErrorType = 
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'rate_limit'
  | 'api_error'
  | 'database_error'
  | 'network_error'
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

export function handleError(error: unknown): AppError {
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
      return new AppError(error.message, 'network_error');
    }
    return new AppError(error.message);
  }

  return new AppError('An unknown error occurred');
}

export function showErrorToast(error: AppError) {
  toast.error(error.message);
}

export const logError = (error: AppError) => {
  console.error(`[${error.type}] ${error.message}`);
  // Here you would typically send the error to your error tracking service
  // Example: sendToErrorTrackingService(error);
};