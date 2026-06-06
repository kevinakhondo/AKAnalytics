import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        // Static marketing pages
        main:         resolve(__dirname, 'index.html'),
        about:        resolve(__dirname, 'about.html'),
        blog:         resolve(__dirname, 'blog.html'),
        insights:     resolve(__dirname, 'insights.html'),
        'insights-1': resolve(__dirname, 'insights-1.html'),
        'insights-2': resolve(__dirname, 'insights-2.html'),
        'insights-3': resolve(__dirname, 'insights-3.html'),
        industries:   resolve(__dirname, 'industries.html'),
        careers:      resolve(__dirname, 'careers.html'),
        'book-online': resolve(__dirname, 'book-online.html'),
        login:        resolve(__dirname, 'login.html'),
        signup:       resolve(__dirname, 'signup.html'),
        thanks:       resolve(__dirname, 'thanks.html'),
        post1:        resolve(__dirname, 'post1.html'),
        post2:        resolve(__dirname, 'post2.html'),
        post3:        resolve(__dirname, 'post3.html'),
        // React portals (now at project root so they output to dist/)
        customer:     resolve(__dirname, 'customer-portal.html'),
        admin:        resolve(__dirname, 'admin-portal.html'),
      },
    },
  },
});
