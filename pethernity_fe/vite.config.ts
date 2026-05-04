import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  // Static assets (.webp / .mp3 / .json) live next to index.html and are
  // referenced via plain HTML/CSS — Vite picks them up automatically
  // from index.html during build.
});
