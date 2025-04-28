self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(["/", "/index.html"]);
    })
  );
  self.skipWaiting(); // <-- langsung aktif setelah install
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== "v1") {
            console.log("Service Worker: Clearing Old Cache");
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // <-- langsung ambil kontrol semua tab
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Handler Push Notification
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  const data = event.data ? event.data.json() : {};

  const title = data.title || "Notifikasi Baru";
  const options = {
    body: data.body || "Anda memiliki notifikasi baru.",
    icon: "/pwa-192x192.png", // pastikan ikon ini ada!
    badge: "/pwa-192x192.png", // opsional
    data: {
      url: data.url || "/" // buat nanti di notificationclick
    }
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.');
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});
