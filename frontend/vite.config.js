import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Keep this project isolated from PostCSS configs in parent directories.
  // Tailwind is handled by the dedicated Vite plugin above.
  css: {
    postcss: {
      plugins: [],
    },
  },
})
