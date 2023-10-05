import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // publicDir: 'assets',
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5010',
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }

})


