import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

// ═══════════════════════════════════════════════════════════
// 🌿 PLANTTRACK V2 — configuración Vite
// base './' para que el build funcione igual en GitHub Pages
// (subpath), en el preview y dentro del WebView de Capacitor.
// ═══════════════════════════════════════════════════════════

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1200,
    },
  };
});
