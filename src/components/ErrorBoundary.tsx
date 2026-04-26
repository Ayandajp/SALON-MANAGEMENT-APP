import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background dark:bg-dark-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-6 border-2 border-danger/20">
              <AlertTriangle className="w-10 h-10 text-danger" aria-hidden="true" />
            </div>
            <h1 className="text-h1 font-heading font-bold text-text-primary dark:text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-body text-text-secondary dark:text-gray-400 mb-8">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            <Button onClick={this.handleReset} className="w-full">
              Return to Dashboard
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}