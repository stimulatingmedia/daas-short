import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the built dist/ works from any static host or sub-folder.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: { target: 'es2020', assetsInlineLimit: 0 },
  server: { port: 5173, strictPort: false },
  preview: { port: 4173, strictPort: false },
});
