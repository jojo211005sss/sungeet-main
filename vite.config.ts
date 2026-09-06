import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Send /api to the local handler server (npm run dev:api). Without this
    // the front end 404s on every endpoint in dev and silently falls back to
    // seed data, so you never exercise the real code path.
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.API_PORT ?? 5174}`,
        changeOrigin: true,
      },
    },
  },
})
