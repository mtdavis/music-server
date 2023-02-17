import {defineConfig} from 'vite';
import eslint from 'vite-plugin-eslint';
import tsc from 'vite-plugin-tsc';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    eslint(),
    tsc(),
  ],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/stream': 'http://localhost:5000',
      '/art': 'http://localhost:5000',
    },
  },
});
