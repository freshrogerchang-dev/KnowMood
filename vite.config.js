import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' 讓打包後的檔案可以直接放在任何子路徑（GitHub Pages / 平板離線開啟）
export default defineConfig({
  plugins: [react()],
  base: './',
  server: { host: true, port: 5173 },
})
