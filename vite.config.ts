import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` is set so the app works when served from a GitHub Pages
// project subpath (https://<user>.github.io/<repo>/). Override with
// BASE_PATH at build time, e.g. BASE_PATH=/crown-rose/ npm run build.
const base = process.env.BASE_PATH ?? '/'

export default defineConfig({
  base,
  plugins: [react()],
})
