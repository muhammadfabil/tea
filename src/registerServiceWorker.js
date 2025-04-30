// src/registerServiceWorker.js

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);

          // 🔁 Cek update secara manual
          registration.update();

          // 🔔 Deteksi SW baru dan beri tahu pengguna
          if (registration.waiting) {
            console.log('New service worker is waiting to activate.');
            notifyUserToRefresh();
          }

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Versi baru tersedia
                  console.log('New content is available; please refresh.');
                  notifyUserToRefresh();
                } else {
                  // Pertama kali install
                  console.log('Content is cached for offline use.');
                }
              }
            };
          };
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });

      // 🔁 Optional: force reload SW saat user kembali ke halaman
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Controller changed - reloading page...');
        window.location.reload();
      });
    });
  }
}

// Notifikasi versi baru tersedia — bisa kamu ubah jadi pakai modal/toast
function notifyUserToRefresh() {
  if (confirm('Versi baru tersedia. Muat ulang untuk memperbarui?')) {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }
}
