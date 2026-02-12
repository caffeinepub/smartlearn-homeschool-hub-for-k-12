import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[GlobalErrorBoundary] Caught error:', error);
    console.error('[GlobalErrorBoundary] Error info:', errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearData = async () => {
    try {
      // Clear app data using the utility
      const { clearAppData } = await import('../utils/clearAppData');
      clearAppData();
      // Reload after clearing
      window.location.reload();
    } catch (err) {
      console.error('[GlobalErrorBoundary] Error clearing data:', err);
      // Fallback: just reload
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-lg border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-destructive/10 p-3">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-xl">Something went wrong</CardTitle>
                  <CardDescription>
                    The application encountered an unexpected error
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                We're sorry for the inconvenience. You can try reloading the page, or if the problem persists, 
                clear the app data to reset to a fresh state.
              </p>
              {this.state.error && (
                <details className="rounded-md bg-muted p-3 text-xs">
                  <summary className="cursor-pointer font-medium">Technical details</summary>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap break-words">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 sm:flex-row">
              <Button
                onClick={this.handleReload}
                className="w-full sm:w-auto"
                variant="default"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
              <Button
                onClick={this.handleClearData}
                className="w-full sm:w-auto"
                variant="outline"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear App Data & Reload
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
