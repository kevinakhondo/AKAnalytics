import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: 'src', // Set the root to the src directory
  build: {
    outDir: '../dist', // Output to the dist folder one level up
    rollupOptions: {
      input: 'src/customer-portal.html', // Explicitly set the input file
    },
  },
  publicDir: '../public', // If you have a public folder, point to it
});