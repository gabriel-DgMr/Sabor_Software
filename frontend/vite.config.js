import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true,
      interval: 1000,
    },
    hmr: {
      overlay: true,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // La dirección de tu servidor backend
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // Opcional: reescribe la ruta si el backend no espera '/api'
      },
    },
  },
});
