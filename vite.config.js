import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: true
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3030',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  resolve: {
    alias: {
      'react-big-calendar': 'react-big-calendar/lib/index.js'
    }
  },
  optimizeDeps: {
    include: ['react-big-calendar']
  },
  build: {
    sourcemap: true
  }
})
