import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // BASE_PATH is set by the GitHub Actions deploy workflow (e.g. /ML-Studio-Backend/).
  // Locally it stays "/" so the dev server works normally.
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
})
