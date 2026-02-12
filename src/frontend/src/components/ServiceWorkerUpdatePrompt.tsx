import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, X } from 'lucide-react';

interface ServiceWorkerUpdatePromptProps {
  isUpdateAvailable: boolean;
}

export function ServiceWorkerUpdatePrompt({ isUpdateAvailable }: ServiceWorkerUpdatePromptProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(isUpdateAvailable);
  }, [isUpdateAvailable]);

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if (registration.waiting) {
          // Tell the waiting service worker to activate
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          
          // Listen for the controlling service worker to change
          navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
          });
        } else {
          // No waiting worker, just reload
          window.location.reload();
        }
      });
    } else {
      // Fallback: just reload
      window.location.reload();
    }
  };

  const handleDismiss = () => {
    setShow(false);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <Alert className="shadow-lg">
        <RefreshCw className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          <span>Update Available</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p className="text-sm">
            A new version of the app is available. Refresh to get the latest features and improvements.
          </p>
          <Button onClick={handleUpdate} size="sm" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh to Update
          </Button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
