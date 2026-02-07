const CACHE_VERSION = 'v1';
const SHELL_CACHE = `artspo-shell-${CACHE_VERSION}`;
const IMAGE_CACHE = `artspo-images-${CACHE_VERSION}`;
const FEED_CACHE = `artspo-feeds-${CACHE_VERSION}`;

const SHELL_FILES = [
  '/',
  '/index.html',
  '/app.css',
  '/app.js',
  '/manifest.webmanifest',
  '/assets/logo.svg'
];

const OFFLINE_PAGE = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ArtsPo - Mode hors ligne</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-color: #f5f5f7;
    }
    .offline-container {
      text-align: center;
      padding: 2rem;
    }
    h1 {
      color: #1a252f;
      margin-bottom: 1rem;
    }
    p {
      color: #555;
      font-size: 1.1rem;
    }
  </style>
</head>
<body>
  <div class="offline-container">
    <h1>Mode hors ligne</h1>
    <p>Vous n'êtes pas connecté à Internet. Veuillez vérifier votre connexion.</p>
  </div>
</body>
</html>`;

// Install event: pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) => {
      return cache.addAll(SHELL_FILES);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          const validCaches = [SHELL_CACHE, IMAGE_CACHE, FEED_CACHE];
          if (!validCaches.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event: apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Network-only for audio files (handled by IndexedDB in app)
  if (url.pathname.match(/\.(mp3|ogg|m4a|wav)$/i) || url.pathname.includes('/api/audio/')) {
    return event.respondWith(fetch(request));
  }

  // Network-first for RSS feeds
  if (url.pathname.match(/\/api\/feed\//) || url.hostname === 'artspo-livresaudio.store' && url.pathname.includes('/feed/')) {
    return event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clonedResponse = response.clone();
            caches.open(FEED_CACHE).then((cache) => {
              cache.put(request, clonedResponse);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response(OFFLINE_PAGE, {
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          });
        })
    );
  }

  // Cache-first for images
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) || url.hostname === 'artspo-livresaudio.store' && url.pathname.includes('/wp-content/uploads/')) {
    return event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((response) => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          const clonedResponse = response.clone();
          caches.open(IMAGE_CACHE).then((cache) => {
            cache.put(request, clonedResponse);
          });
          return response;
        }).catch(() => {
          return new Response('Image not available', { status: 404 });
        });
      })
    );
  }

  // Cache-first for app shell
  return event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        const clonedResponse = response.clone();
        caches.open(SHELL_CACHE).then((cache) => {
          cache.put(request, clonedResponse);
        });
        return response;
      }).catch(() => {
        return caches.match('/index.html').then((cachedResponse) => {
          return cachedResponse || new Response(OFFLINE_PAGE, {
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
          });
        });
      });
    })
  );
});
