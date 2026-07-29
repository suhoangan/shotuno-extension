import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || 'Something went wrong' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Shotuno ErrorBoundary:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-[40vh] w-full items-center justify-center p-6">
        <div className="max-w-sm space-y-3 rounded-xl border border-border bg-card p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">
            {this.props.fallbackTitle || 'Something went wrong'}
          </h2>
          <p className="text-sm text-muted-foreground break-words">{this.state.message}</p>
          <Button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="w-full"
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }
}
