import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// W trybie dev zapytania /api/* idą do backendu na :3001 (dzięki temu nie ma problemów z CORS).
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
});
