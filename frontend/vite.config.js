import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // Fixed port for your React app
    proxy: {
      // Isse aap frontend mein '/api' use kar payenge aur ye automatic 
      // localhost:3000 par redirect ho jayega (Development convenience ke liye)
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})