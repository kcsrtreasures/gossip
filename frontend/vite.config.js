import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  //   server: {
  //   host: '127.0.0.1',
  //   port: 5173
  // },

  plugins: [react()],
})
