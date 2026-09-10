import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      includeAssets: ['favicon.svg', 'pwa-icon.svg', 'logo.png'],
      manifest: {
        name: 'Shahi Bhoj - Restaurant OS',
        short_name: 'Shahi Bhoj',
        description: 'Restaurant billing, kitchen, inventory and reports in one app.',
        theme_color: '#150f26',
        background_color: '#f7f5fc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/logo.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
        navigateFallbackDenylist: [/^\/dev-sw/, /^\/sitemap\.xml$/, /^\/robots\.txt$/],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
})
