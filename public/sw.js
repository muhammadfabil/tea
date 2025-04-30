// Constants
const CACHE_NAME = "v1";
const ASSETS_TO_CACHE = [
  "/", 
  "/index.html",
  "/pwa-192x192.png"
];

// Install Event
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Service Worker: Clearing Old Cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Improved Fetch Event Handler
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests like the problematic placeholder images
  if (!event.request.url.startsWith(self.location.origin) && 
      !event.request.url.includes('placehold.co')) {
    return;
  }
  
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clone the response before using it
        const responseClone = response.clone();
        
        // Only cache successful responses
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        
        return response;
      })
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // For image requests that fail, return a fallback image
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/) || 
                event.request.url.includes('placehold.co')) {
              return caches.match('/pwa-192x192.png')
                .then(fallback => {
                  if (fallback) return fallback;
                  return new Response('Image not found', { 
                    status: 404, 
                    headers: { 'Content-Type': 'text/plain' } 
                  });
                });
            }
            
            // If nothing in cache, return simple 404
            return new Response('Resource not found', { 
              status: 404, 
              headers: { 'Content-Type': 'text/plain' } 
            });
          });
      })
  );
});

// Message Handler (for SKIP_WAITING)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push Notification Handler
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      console.error("Error parsing push event data:", error);
    }
  }

  const title = data.title || "Notifikasi Baru";
  const options = {
    body: data.body || "Anda memiliki notifikasi baru.",
    icon: "/pwa-192x192.png", 
    badge: "/pwa-192x192.png",
    data: {
      url: data.url || "/" // Used on click
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification Click Handler
self.addEventListener("notificationclick", (event) => {
  console.log("Notification click received:", event);

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus if tab already open
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new tab
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url || '/');
      }
    })
  );
});
