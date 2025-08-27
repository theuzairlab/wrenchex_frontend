'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
  errorBoundaryStack?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showReload?: boolean;
  level?: 'page' | 'component' | 'critical';
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Generate a unique error ID for tracking
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError } = this.props;
    
    this.setState({
      errorInfo,
    });

    // Log error for monitoring/analytics
    console.error('ErrorBoundary caught an error:', {
      error,
      errorInfo,
      errorId: this.state.errorId,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo);
    }

    // Report to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
      });
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = 3;

    if (retryCount < maxRetries) {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
        showDetails: false,
      });

      // Reset retry count after successful render
      this.retryTimeoutId = window.setTimeout(() => {
        this.setState({ retryCount: 0 });
      }, 30000); // Reset after 30 seconds
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  getErrorSeverity = () => {
    const { error } = this.state;
    const { level = 'component' } = this.props;

    if (level === 'critical') return 'critical';
    if (level === 'page') return 'high';
    
    // Determine severity based on error type
    if (error?.name === 'ChunkLoadError') return 'medium';
    if (error?.message?.includes('Network')) return 'medium';
    if (error?.message?.includes('fetch')) return 'medium';
    
    return 'low';
  };

  getErrorTitle = () => {
    const severity = this.getErrorSeverity();
    
    switch (severity) {
      case 'critical':
        return 'Application Error';
      case 'high':
        return 'Page Error';
      case 'medium':
        return 'Loading Error';
      default:
        return 'Something went wrong';
    }
  };

  getErrorMessage = () => {
    const { error } = this.state;
    const severity = this.getErrorSeverity();

    if (error?.name === 'ChunkLoadError') {
      return 'Failed to load application resources. This might be due to a network issue or an application update.';
    }

    if (error?.message?.includes('Network')) {
      return 'Network connection error. Please check your internet connection and try again.';
    }

    switch (severity) {
      case 'critical':
        return 'A critical error occurred that prevents the application from functioning properly. Our team has been notified.';
      case 'high':
        return 'This page encountered an error and cannot be displayed properly.';
      case 'medium':
        return 'Some content failed to load. You can try refreshing the page or continue using other features.';
      default:
        return 'A minor error occurred. Most features should still work normally.';
    }
  };

  renderFallbackUI() {
    const { showReload = true, level = 'component' } = this.props;
    const { error, errorInfo, errorId, showDetails, retryCount } = this.state;
    const severity = this.getErrorSeverity();
    const maxRetries = 3;

    const severityColors = {
      critical: 'border-red-200 bg-red-50',
      high: 'border-orange-200 bg-orange-50',
      medium: 'border-yellow-200 bg-yellow-50',
      low: 'border-blue-200 bg-blue-50',
    };

    const iconColors = {
      critical: 'text-red-600',
      high: 'text-orange-600',
      medium: 'text-yellow-600',
      low: 'text-blue-600',
    };

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        level === 'component' ? 'min-h-0 py-8' : ''
      }`}>
        <Card className={`max-w-lg w-full ${severityColors[severity]} border-2`}>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <AlertTriangle className={`h-8 w-8 ${iconColors[severity]}`} />
              <div>
                <CardTitle className="text-gray-900">
                  {this.getErrorTitle()}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Error ID: {errorId}
                </p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-gray-700">
              {this.getErrorMessage()}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3">
              {retryCount < maxRetries && (
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                  className="w-full"
                >
                  Try Again {retryCount > 0 && `(${retryCount}/${maxRetries})`}
                </Button>
              )}

              <div className="flex space-x-3">
                {showReload && (
                  <Button
                    onClick={this.handleReload}
                    variant="secondary"
                    leftIcon={<RefreshCw className="h-4 w-4" />}
                    className="flex-1"
                  >
                    Reload Page
                  </Button>
                )}
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  leftIcon={<Home className="h-4 w-4" />}
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>
            </div>

            {/* Error Details Toggle */}
            <div className="border-t pt-4">
              <button
                onClick={this.toggleDetails}
                className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <span className="flex items-center">
                  <Bug className="h-4 w-4 mr-2" />
                  Technical Details
                </span>
                {showDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showDetails && (
                <div className="mt-3 p-3 bg-gray-100 rounded-lg text-xs font-mono">
                  <div className="mb-2">
                    <strong>Error:</strong> {error?.name}
                  </div>
                  <div className="mb-2">
                    <strong>Message:</strong> {error?.message}
                  </div>
                  {error?.stack && (
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs overflow-auto max-h-32">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {errorInfo?.componentStack && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs overflow-auto max-h-32">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Additional Help */}
            <div className="text-xs text-gray-500 border-t pt-3">
              If this problem persists, please contact support with the Error ID above.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  render() {
    const { hasError } = this.state;
    const { children, fallback } = this.props;

    if (hasError) {
      return fallback || this.renderFallbackUI();
    }

    return children;
  }
}

// Higher-order component for functional components
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Specialized error boundaries
export function PageErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <ErrorBoundary level="page" {...props}>
      {children}
    </ErrorBoundary>
  );
}

export function ComponentErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <ErrorBoundary level="component" {...props}>
      {children}
    </ErrorBoundary>
  );
}

export function CriticalErrorBoundary({ children, ...props }: Omit<ErrorBoundaryProps, 'level'>) {
  return (
    <ErrorBoundary level="critical" {...props}>
      {children}
    </ErrorBoundary>
  );
}

export default ErrorBoundary; 