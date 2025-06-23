import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import mkcert from 'vite-plugin-mkcert';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mkcert()],
  server: {
    // Setze https auf ein leeres Objekt, um den TypeScript-Fehler zu beheben.
    // Das mkcert-Plugin wird dies automatisch konfigurieren.
    https: {},
    host: true, // Auf allen Netzwerk-Interfaces lauschen
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});


