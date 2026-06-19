import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflare()],
  // บังคับให้เซิร์ฟเวอร์เคลียร์แคชและรีเซ็ตทุกอย่างใหม่
  server: {
    watch: {
      usePolling: true,
    },
  },
})