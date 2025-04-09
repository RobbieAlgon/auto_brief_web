import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      external: ['axios'],
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'axios'],
          supabase: ['@supabase/supabase-js'],
          pdf: ['jspdf'],
          ui: ['@radix-ui/react-alert-dialog', '@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-slot', '@radix-ui/react-toast'],
        },
      },
    },
  },
  server: {
    port: 5173,
    host: true,
  },
})
