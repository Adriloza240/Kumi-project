import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/Kumi-project/',
  server: {
    proxy: {
      // Para desarrollo local
      '/db.json': {
        target: 'http://localhost:5173',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/db.json/, '/db.json')
      }
    }
  }
});
