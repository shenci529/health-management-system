import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  base: '/health-management-system/',
  plugins: [createVuePlugin()]
})
