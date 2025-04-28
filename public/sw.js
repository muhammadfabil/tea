self.addEventListener("install", (event) => {
  console.log("Service Worker: Installed");
  event.waitUntil(
    caches.open("v1").then((cache) => {
      return cache.addAll(["/", "/index.html"]);
    })
  );
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
});

self.addEventListener("fetch", (event) => {
  // Exclude the service worker file itself
  if (event.request.url.includes("/sw.js")) {
    return;
  }

  // Let API requests pass through without caching
  if (event.request.url.includes("/api/")) {
    return;
  }

  // Handle static assets
  if (event.request.method === "GET" && event.request.destination !== "document") {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});

// Handle Push Notification
self.addEventListener("push", (event) => {
  console.log("Push notification received");

  let notificationData;
  try {
    notificationData = event.data ? event.data.json() : {};
    console.log("Push data:", notificationData);
  } catch (error) {
    console.error("Error parsing push data:", error);
    notificationData = {
      title: "New Notification",
      body: "You have a new notification",
    };
  }

  const options = {
    body: notificationData.body || "You have a new notification",
    icon: "/icon-192x192.png",
    badge: "/icon-192x192.png",
    data: notificationData.data || {},
    requireInteraction: true,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title || "Notification", options)
  );
});

// Handle Notification Click
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);
  event.notification.close();

  const url = event.notification.data?.url || "/mahasiswa/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === url && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});