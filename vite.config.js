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
      injectRegister: 'auto',
      registerType: 'autoUpdate',
      manifest: {
        name: 'Sistem Manajemen Layanan Administrasi dan Antrean Program Studi',
        short_name: 'SIMANTAP',
        description: 'Web App untuk sistem antrian pelayanan administrasi dan bimbingan dosen',
        theme_color: '#1277C9',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'logo.png', // Gunakan satu file logo
            sizes: '192x192', // Ukuran untuk ikon kecil
            type: 'image/png',
          },
          {
            src: 'logo.png', // File yang sama
            sizes: '512x512', // Ukuran untuk ikon besar
            type: 'image/png',
          },
          {
            src: 'logo.png', // File yang sama
            // Ukuran besar untuk maskable icon
                  type: 'image/png',
                  purpose: 'any maskable',
                  },
                ],
                },
                devOptions: {
                enabled: true,
                type: 'module',
                navigateFallback: 'index.html',
                suppressWarnings: true,
                },
                workbox: {
                runtimeCaching: [
                  {
                  urlPattern: /^http:\/\/127\.0\.0\.1:8000\/.*$/, // Sesuaikan dengan domain API Anda
            handler: 'NetworkOnly', // Jangan cache API
          },
        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000', // Sesuaikan dengan URL API Anda
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
