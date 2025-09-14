import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  const LOG_URL = isProd
    ? "https://hoseatongho-h5onpdk3ka-ts.a.run.app"
    : "http://localhost:8081";

  return {
    plugins: [react()],
    resolve: {
      alias: { "@": resolve(__dirname, "src") },
    },
    define: {
      __LOG_URL__: JSON.stringify(LOG_URL),
    },
    server: {
      proxy: {
        // Self-hosted PISTON API: /piston/* => http://170.64.241.58/api/v2/*
        "/piston": {
          target: "http://170.64.241.58",
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/piston/, "/api/v2"),
        },

        "/api": {
          target: process.env.SERVER_URL || "http://localhost:8080",
          changeOrigin: true,
          secure: false,
        },
        "/log": {
          target: LOG_URL,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
