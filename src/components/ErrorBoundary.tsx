import * as React from 'react';
import { Button } from './ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<any, any> {
  state = {
    hasError: false,
    error: null as Error | null,
  };

  public static getDerivedStateFromError(error: Error): any {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: any) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 text-center">
          <div className="max-w-md space-y-4">
            <h1 className="text-2xl font-display font-bold">Something went wrong</h1>
            <p className="text-muted-foreground italic">"Even the most beautiful verses can have a broken line."</p>
            <div className="bg-muted p-4 rounded-lg text-left overflow-auto max-h-40 text-xs font-mono">
              {this.state.error?.message}
            </div>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
