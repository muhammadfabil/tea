import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // penting!
      injectRegister: 'auto',     // auto daftar SW ke index.html

      manifest: {
        name: 'Sistem Antrian Pelayanan Prodi & Administrasi',
        short_name: 'AntrianProdi',
        description: 'Web App PWA untuk sistem antrian pelayanan administrasi dan bimbingan dosen',
        theme_color: '#1277C9',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,

        runtimeCaching: [
          {
            // HTML documents (utama)
            urlPattern: ({ request }) => request.destination === 'document',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24, // 1 hari
              },
            },
          },
          {
            // Static files (JS/CSS)
            urlPattern: ({ request }) =>
              request.destination === 'style' || request.destination === 'script',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 hari
              },
            },
          },
          {
            // Backend API (Railway FastAPI)
            urlPattern: /^https:\/\/.*\.railway\.app\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 3600, // 1 jam
              },
            },
          },
        ],
      },

      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
        suppressWarnings: true,
      },
    }),
  ],

  // Menambahkan konfigurasi proxy di sini
  server: {
    proxy: {
      '/dosen': 'http://127.0.0.1:8000',  // Mengarahkan ke server backend lokal
    },
  },
});
