/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

// Precache build-time assets (injected by VitePWA)
precacheAndRoute(self.__WB_MANIFEST || []);

// Ketika service worker pertama kali diinstal
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install');
  self.skipWaiting(); // Aktifkan segera tanpa menunggu tab ditutup
});

// Ketika service worker mengambil alih
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate');
  return self.clients.claim(); // Klaim kontrol semua klien
});

// HTML documents
registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: 'html-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 }), // 1 day
    ],
  })
);

// JS/CSS
registerRoute(
  ({ request }) => request.destination === 'script' || request.destination === 'style',
  new StaleWhileRevalidate({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }), // 30 days
    ],
  })
);

// Images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }), // 30 days
    ],
  })
);

// API Data - Don't cache push endpoint
registerRoute(
  ({ url }) => {
    return url.origin.includes('https://simantap-api.ifsyscenter.my.id/') && 
           !url.pathname.includes('/wp/push/');
  },
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 300 }), // 5 minutes
    ],
  })
);

// Push Notifications
self.addEventListener("push", (event) => {
  console.log('[Service Worker] Push Received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
      console.log('[Service Worker] Push data:', data);
    } catch (e) {
      console.error('[Service Worker] Failed to parse push data:', e);
    }
  }

  const title = data.title || "Notifikasi SIMANTAP";
  const options = {
    body: data.body || "Anda memiliki notifikasi baru.",
    icon: "/logo.png",
    badge: "/logo.png",
    tag: "simantap-notification", // Tambahkan tag untuk mengelola notifikasi
    renotify: true, // Notifikasi baru tetap muncul meskipun tag sama
    vibrate: [100, 50, 100], // Pola vibrasi (miliseconds)
    requireInteraction: true, // Penting: notifikasi tetap muncul sampai interaksi user
    data: {
      url: data.url || "/",
      timestamp: new Date().getTime(),
      ...data.data
    },
    actions: [
      {
        action: 'open',
        title: 'Lihat',
      }
    ]
  };

  // Log untuk debugging
  console.log('[Service Worker] Showing notification with options:', options);
  
  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[Service Worker] Notification displayed successfully'))
      .catch(err => console.error('[Service Worker] Error showing notification:', err))
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log('[Service Worker] Notification click received:', event);
  
  event.notification.close();
  
  // Handle actions jika user klik action button
  if (event.action === 'open') {
    console.log('[Service Worker] User clicked "Open" action');
  }
  
  const urlToOpen = event.notification.data.url || '/';
  console.log('[Service Worker] Opening URL:', urlToOpen);
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Cek apakah ada tab yang sudah terbuka dengan URL yang sama
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && "focus" in client) {
            console.log('[Service Worker] Focusing existing client');
            return client.focus();
          }
        }
        
        // Jika tidak ada, buka tab baru
        console.log('[Service Worker] Opening new window');
        return clients.openWindow(urlToOpen);
      })
      .catch(err => console.error('[Service Worker] Error handling notification click:', err))
  );
});

// Handle subscriptionchange event
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[Service Worker] Subscription changed', event);
  // Additional handling could be implemented here if needed
});

self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
