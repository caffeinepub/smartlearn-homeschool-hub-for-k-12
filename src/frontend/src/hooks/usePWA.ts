import { useState, useEffect } from 'react';

interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
}

export function usePWA(): PWAStatus {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    // Check if app is installed (standalone mode)
    const checkInstalled = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      const ios = (window.navigator as any).standalone === true;
      setIsInstalled(standalone || ios);
    };

    checkInstalled();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Enhanced service worker update detection
    if ('serviceWorker' in navigator) {
      // Check for updates on registration
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        // Check for updates periodically
        const checkForUpdates = () => {
          registration.update().catch((err) => {
            console.warn('[usePWA] Update check failed:', err);
          });
        };

        // Check for updates every 60 seconds
        const updateInterval = setInterval(checkForUpdates, 60000);

        // Listen for new service worker installing
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[usePWA] New service worker installed, update available');
                setIsUpdateAvailable(true);
              }
            });
          }
        });

        // Check if there's already a waiting worker
        if (registration.waiting) {
          console.log('[usePWA] Service worker already waiting');
          setIsUpdateAvailable(true);
        }

        return () => {
          clearInterval(updateInterval);
        };
      }).catch((err) => {
        console.error('[usePWA] Service worker registration failed:', err);
      });

      // Listen for controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[usePWA] Controller changed, reloading...');
        window.location.reload();
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isInstalled, isOnline, isUpdateAvailable };
}
