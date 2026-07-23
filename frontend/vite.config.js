import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    // Only proxy to local Flask server during development
    proxy: command === 'serve' ? {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    } : {},
  },
}))
