import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'pwa-icon.svg'],
      manifest: {
        name: 'Bhojjan - Restaurant OS',
        short_name: 'Bhojjan',
        description: 'Restaurant billing, kitchen, inventory and reports in one app.',
        theme_color: '#150f26',
        background_color: '#f7f5fc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/pwa-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallbackDenylist: [/^\/dev-sw/],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
