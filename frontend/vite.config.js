import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // บังคับให้เซิร์ฟเวอร์เคลียร์แคชและรีเซ็ตทุกอย่างใหม่
  server: {
    watch: {
      usePolling: true,
    },
  },
})