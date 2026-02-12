import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, RefreshCw } from 'lucide-react';

interface ActorNotReadyStateProps {
  onRetry?: () => void;
}

export function ActorNotReadyState({ onRetry }: ActorNotReadyStateProps) {
  return (
    <div className="flex min-h-[400px] items-center justify-center p-4">
      <Alert className="max-w-md">
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertTitle>Connecting to the network</AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>
            The connection to the backend is still initializing. This usually takes just a moment.
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry Connection
            </Button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
