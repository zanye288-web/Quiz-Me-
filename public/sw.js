// Quiz Me! Progressive Web App Service Worker
// Provides full offline functionality for core assets, quiz runners, and curriculum data.

const SHELL_CACHE_NAME = 'quizme-shell-v4';
const DATA_CACHE_NAME = 'quizme-data-v4';

// Core assets to precache on installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.svg',
  '/icon-512.svg',
];

// Install Event: Precache core shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Precaching app shell assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[ServiceWorker] Precache failed:', err);
      })
  );
});

// Activate Event: Cleanup old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== SHELL_CACHE_NAME && cacheName !== DATA_CACHE_NAME) {
              console.log('[ServiceWorker] Clearing legacy cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Intelligent offline caching strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension, internal, or non-http protocols
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 1. Navigation requests: Network-first with cached index.html fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and cache the latest HTML
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(SHELL_CACHE_NAME).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(async () => {
          // Offline fallback to cached index
          const cachedResponse = await caches.match('/');
          if (cachedResponse) return cachedResponse;
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) return cachedIndex;
          return new Response('<h1>Quiz Me! Offline</h1><p>Application shell cached. Please refresh or reconnect.</p>', {
            headers: { 'Content-Type': 'text/html' },
          });
        })
    );
    return;
  }

  // 2. Static Assets (Scripts, Styles, Fonts, Images, SVGs)
  const isStaticAsset =
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.includes('/assets/') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com');

  if (isStaticAsset) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const contentType = response.headers.get('content-type') || '';
          const isValidMime =
            !url.pathname.endsWith('.js') || !contentType.includes('text/html');
          if (response && response.status === 200 && isValidMime) {
            const copy = response.clone();
            caches.open(SHELL_CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response('', { status: 408 });
        })
    );
    return;
  }

  // 3. Quiz Data & API calls: Network-first, fallback to DATA cache
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(JSON.stringify({ error: 'Network offline. Using local cached data.' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // Default: Network with Cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// Message Listener for client triggers
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_QUIZ_DATA') {
    const { key, payload } = event.data;
    if (key && payload) {
      caches.open(DATA_CACHE_NAME).then((cache) => {
        const fakeRequest = new Request(`/offline-quiz/${encodeURIComponent(key)}`);
        const response = new Response(JSON.stringify(payload), {
          headers: { 'Content-Type': 'application/json' },
        });
        cache.put(fakeRequest, response);
        console.log('[ServiceWorker] Cached quiz data for offline play:', key);
      });
    }
  }
});
