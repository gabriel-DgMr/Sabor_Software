import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDevelopment = mode === 'development';
  const isProduction = mode === 'production';

  return {
    plugins: [react()],

    // Configuración para desarrollo
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
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // Configuración para build de producción
    build: {
      outDir: 'dist',
      sourcemap: false, // Desactivar sourcemaps en producción por seguridad
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction, // Remover console.log en producción
          drop_debugger: isProduction,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar dependencias grandes en chunks
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': ['react-icons', 'react-toastify'],
            'chart-vendor': ['chart.js', 'react-chartjs-2'],
            'socket-vendor': ['socket.io-client'],
          },
          // Configurar nombres de archivos para cacheo
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      // Optimizaciones adicionales
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
    },

    // Optimizaciones generales
    define: {
      __DEV__: isDevelopment,
    },

    // Configuración de alias para imports más limpios
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@services': resolve(__dirname, 'src/services'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@styles': resolve(__dirname, 'src/styles'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@context': resolve(__dirname, 'src/context'),
      },
    },

    // Configuración de preview para testing de build
    preview: {
      port: 4173,
      host: true,
    },
  };
});
