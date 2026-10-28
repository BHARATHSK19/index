import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// React front end for ojix.in. `npm run dev` serves it on :5173 and forwards /api to the
// Express server on :3000; `npm run build` writes web/dist, which server.js serves.
export default defineConfig({
  root: import.meta.dirname,
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "static",
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
    proxy: { "/api": "http://localhost:3000" },
  },
});
