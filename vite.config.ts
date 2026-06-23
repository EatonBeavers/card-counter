import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';

// Vite drives both the React renderer and the Electron main/preload bundles.
// `vite-plugin-electron/simple` keeps the three build targets in one config.
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: fileURLToPath(new URL('./electron/preload.ts', import.meta.url)),
      },
      // Renderer can use a curated subset of Node built-ins if ever needed.
      renderer: {},
    }),
  ],
  build: {
    outDir: 'dist',
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
  },
});
