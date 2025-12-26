import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      '@components': path.resolve(__dirname, './src/components'),
      '@features': path.resolve(__dirname, './src/features'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@store': path.resolve(__dirname, './src/store'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@routes': path.resolve(__dirname, './src/routes'),
      '@services': path.resolve(__dirname, './src/services'),
    }
  },
  optimizeDeps: {
    include: ['date-fns']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React & Router
          vendor: [
            'react',
            'react-dom',
            'react-router-dom',
          ],
          // Redux & State Management
          redux: [
            '@reduxjs/toolkit',
            'react-redux',
          ],
          // UI Component Libraries
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tabs',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            'lucide-react',
          ],
          // Charts & Visualization
          charts: [
            'recharts',
          ],
          // Maps
          maps: [
            'leaflet',
          ],
          // Forms & Validation
          forms: [
            'react-hook-form',
            '@hookform/resolvers',
            'zod',
          ],
          // Date & Time
          dates: [
            'date-fns',
            'react-datepicker',
            'react-day-picker',
          ],
          // Communication
          communication: [
            'socket.io-client',
            'axios',
          ],
        },
      },
    },
  },
})

