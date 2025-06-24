import { defineConfig } from 'vite';

export default defineConfig({
  // We can add plugins or other configurations here if needed later.
  // For now, defaults are mostly fine.
  // Ensure the public directory is set if we move assets there.
  // publicDir: 'public',
  build: {
    // Output directory for the build
    outDir: 'dist',
    // Sourcemaps for easier debugging in production (optional)
    sourcemap: true,
  },
  server: {
    // Open the browser automatically when the dev server starts (optional)
    // open: true,
  }
});
