import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Only proxy actual API calls, not frontend routes
      '/admin/login': 'http://localhost:8000',
      '/admin/logout': 'http://localhost:8000',
      '/admin/password': 'http://localhost:8000',
      '/admin/verify': 'http://localhost:8000',
      '/admin/dashboard/stats': 'http://localhost:8000',
      '/admin/dashboard/quick-stats': 'http://localhost:8000',
      '/admin/employees': 'http://localhost:8000',
      '/admin/leaves': 'http://localhost:8000',
      '/admin/attendance': 'http://localhost:8000',
      '/employee/auth': 'http://localhost:8000',
      '/employee/leaves': 'http://localhost:8000',
      '/employee/attendance': 'http://localhost:8000',
    },
  },
}) 