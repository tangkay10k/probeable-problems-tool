import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(() => {
  const isProd = import.meta.env.PROD;

  return {
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
          target: isProd ? "https://probeable-problems-837455747674.australia-southeast1.run.app/" : "http://localhost:8081",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
