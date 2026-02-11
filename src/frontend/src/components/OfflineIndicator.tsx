import { usePWA } from '@/hooks/usePWA';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function OfflineIndicator() {
  const { isOnline } = usePWA();
  const [showOffline, setShowOffline] = useState(false);
  const [showOnline, setShowOnline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOffline(true);
      setShowOnline(false);
    } else {
      if (showOffline) {
        setShowOnline(true);
        setTimeout(() => setShowOnline(false), 3000);
      }
      setShowOffline(false);
    }
  }, [isOnline, showOffline]);

  if (!showOffline && !showOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm animate-in slide-in-from-left-5">
      {showOffline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            You're offline. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}
      {showOnline && (
        <Alert className="border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            You're back online!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
