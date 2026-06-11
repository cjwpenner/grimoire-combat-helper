import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  // The site is served at the root of the custom domain https://dandmonsters.com/
  // (GitHub Pages custom domains serve from /, not /<repo-name>/).
  base: '/',
  plugins: [react(), tailwindcss()],
})
