// Version-based cache names for reliable invalidation
const VERSION = '2';
const STATIC_CACHE = `homeschool-hub-static-v${VERSION}`;
const DYNAMIC_CACHE = `homeschool-hub-dynamic-v${VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/generated/classroom-hero.dim_800x600.png',
  '/assets/generated/grading-icon.dim_64x64.png',
  '/assets/generated/graduation-cap-icon.dim_64x64.png',
  '/assets/generated/history-icon.dim_64x64.png',
  '/assets/generated/language-arts-icon.dim_64x64.png',
  '/assets/generated/lesson-plan-icon.dim_64x64.png',
  '/assets/generated/math-icon.dim_64x64.png',
  '/assets/generated/progress-icon.dim_64x64.png',
  '/assets/generated/science-icon.dim_64x64.png',
  '/assets/generated/social-studies-icon.dim_64x64.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version', VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches aggressively
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version', VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete any cache that doesn't match current version
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Recache critical shell assets to ensure fresh content
      return caches.open(STATIC_CACHE).then((cache) => {
        console.log('[Service Worker] Recaching shell assets');
        return cache.addAll(['/index.html', '/']);
      });
    })
  );
  // Take control of all clients immediately
  return self.clients.claim();
});

// Fetch event - network-first for navigation, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip API calls to Internet Computer backend (network-first, no cache)
  if (url.pathname.includes('/api/') || url.pathname.includes('canister')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return cached version if available (for offline resilience)
        return caches.match(request);
      })
    );
    return;
  }

  // Network-first strategy for navigation requests (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache successful navigation responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cached HTML for offline navigation
          return caches.match('/index.html').then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Last resort: return a basic offline page
            return new Response(
              '<html><body><h1>Offline</h1><p>Please check your connection.</p></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // Cache-first strategy for static assets (images, fonts, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone and cache the response
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, responseClone);
        });

        return response;
      }).catch(() => {
        // No cached version and network failed
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});
