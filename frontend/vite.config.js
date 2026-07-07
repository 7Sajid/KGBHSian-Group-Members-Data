import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During development, requests to /api/* are forwarded to the Express
// backend on port 4000, so the frontend can just call fetch('/api/...')
// without worrying about CORS or hardcoding a host.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000'
    }
  }
});
