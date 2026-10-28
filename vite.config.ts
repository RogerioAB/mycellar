import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MyCellar',
        short_name: 'MyCellar',
        description: 'Gerencie sua adega de vinhos',
        theme_color: '#7f1d1d',
        background_color: '#1c1917',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
      // Sem `runtimeCaching`: por padrão o Workbox só intercepta o que está no
      // precache (o app shell). Chamadas cross-origin ao Supabase (auth/dados/storage)
      // nunca passam pelo service worker, então nunca são cacheadas.
    }),
  ],
})
