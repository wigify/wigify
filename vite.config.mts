import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: 'src/main/main.ts',
        vite: {
          resolve: {
            alias: {
              '@': path.resolve(__dirname, './src'),
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'src/preload/preload.ts'),
        vite: {
          resolve: {
            alias: {
              '@': path.resolve(__dirname, './src'),
            },
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        widget: path.resolve(__dirname, 'widget.html'),
      },
    },
  },
});
