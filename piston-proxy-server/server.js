import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";

const app = express();

app.use(cors());

// 🔧 Proxy /piston/* → http://170.64.241.58/api/v2/*
app.use(
  "/piston",
  createProxyMiddleware({
    target: "http://170.64.241.58",
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\/piston/, "/api/v2"),
    logLevel: "debug",
    onProxyReq: (proxyReq, req) => {
      console.log(`[proxy] ${req.method} ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
      console.error("[proxy error]", err);
    },
  }),
);

app.get("/", (_req, res) => res.send("Proxy service is running"));

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on ${port}`));
