import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: set base to repo name (e.g., '/DIYPCB-DESIGNER/')
  // For root deployment or other static hosts, use '/'
  base: './',
  build: {
    target: 'esnext',
  },
})
