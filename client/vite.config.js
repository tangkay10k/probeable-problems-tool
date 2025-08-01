import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: process.env.SERVER_URL || "http://localhost:8080",
        changeOrigin: true,
        secure: false,
      },
      "/log": {
        target: process.env.LOGGING_SERVER_URL || "http://localhost:8081",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
