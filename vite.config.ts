import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' makes the built game work on GitHub Pages project sites
export default defineConfig({
  plugins: [react()],
  base: './',
})
