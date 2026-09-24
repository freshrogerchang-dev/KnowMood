import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// base: './' 讓打包後的檔案可以直接放在任何子路徑（GitHub Pages / 平板離線開啟）
export default defineConfig({
  plugins: [
    react(),
    // 真正的離線：把整個 App 預先快取起來。
    // 小朋友最需要情緒工具的時候（出門、坐車、網路不穩）往往就是連不上網的時候，
    // 所以「加到主畫面」之後一定要能離線開。
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      // 相對路徑：GitHub Pages 放在 /KnowMood/ 子目錄下也能正確註冊
      base: './',
      scope: './',
      manifest: {
        name: '認識情緒',
        short_name: '認識情緒',
        description: '給 5-6 歲小朋友的情緒認知互動遊戲',
        lang: 'zh-Hant-TW',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'any',
        background_color: '#FBF7F0',
        theme_color: '#FBF7F0',
        icons: [
          { src: './icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: './icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: './icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3,wav}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
  base: './',
  server: { host: true, port: 5173 },
})
