import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
      console.error('Production error:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      });
    }
  }

  handleRefresh = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center">
          <div className="max-w-md w-full mx-4">
            <div className="bg-black border-2 border-red-500 rounded-lg p-6 text-center">
              <div className="mb-4">
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="text-xl font-mono font-bold text-red-400 mb-2">
                  Something went wrong
                </h2>
                <p className="text-gray-400 font-mono text-sm mb-4">
                  Winston AI encountered an unexpected error
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-900 border border-gray-700 rounded p-3 mb-4 text-left">
                  <p className="font-mono text-xs text-red-400 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  {this.state.error.stack && (
                    <pre className="font-mono text-xs text-gray-500 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-[#32CD32] text-black py-2 px-4 rounded font-mono font-bold hover:bg-green-400 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleRefresh}
                  className="w-full bg-black border border-gray-600 text-gray-300 py-2 px-4 rounded font-mono hover:bg-gray-800 transition-colors"
                >
                  Refresh Page
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-800">
                <p className="text-xs text-gray-500 font-mono">
                  If this persists, please contact support
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 