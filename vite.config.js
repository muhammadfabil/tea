import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
      injectRegister: 'script',
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'robots.txt'],
      manifest: {
        name: 'Sistem Manajemen Layanan Administrasi dan Antrean Program Studi',
        short_name: 'SIMANTAP',
        description: 'Web App untuk sistem antrian pelayanan administrasi dan bimbingan dosen',
        theme_color: '#1277C9',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        orientation: 'any',
        scope: '/',
        icons: [
          {
            src: 'logo.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'logo.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        categories: ['education', 'productivity'],
        shortcuts: [
          {
            name: 'Dashboard',
            url: '/mahasiswa/dashboard',
            description: 'Lihat Dashboard'
          }
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html',
        suppressWarnings: true,
      },
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/simantap-api\.ifsyscenter\.my\.id\/wp\/push\/.*$/,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/simantap-api\.ifsyscenter\.my\.id\/.*$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /^http:\/\/127\.0\.0\.1:8000\/.*$/,
            handler: 'NetworkOnly',
          },
        ],
        debug: true,
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.js',
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://simantap-api.ifsyscenter.my.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
