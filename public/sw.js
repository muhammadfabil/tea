const CACHE_NAME = "pwa-cache-v2"; // Ganti ini saat ada update
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/pwa-192x192.png",
];

// Install
self.addEventListener("install", (event) => {
  console.log("[SW] Installing");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Precaching assets");
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting(); // Langsung aktif setelah install
});

// Activate
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[SW] Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Ambil alih semua tab
});

// Fetch (Network first, fallback ke cache)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => response)
      .catch(() => caches.match(event.request))
  );
});

// Push
self.addEventListener("push", (event) => {
  console.log("[SW] Push event received");

  let data = {};
  try {
    data = event.data?.json() || {};
  } catch (err) {
    console.error("[SW] Push data error:", err);
  }

  const title = data.title || "Notifikasi Baru";
  const options = {
    body: data.body || "Anda memiliki notifikasi baru.",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification click");
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Tambahan penting: Agar bisa skip waiting saat ada SW baru
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[SW] SKIP_WAITING message received");
    self.skipWaiting();
  }
});
