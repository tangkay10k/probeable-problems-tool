import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import cors from "cors";

const app = express();

app.use(cors());

// 📝 Log incoming requests (helps debug in Cloud Run logs)
app.use((req, _res, next) => {
  console.log(`[in] ${req.method} ${req.originalUrl}`);
  next();
});

// ⚙️ Proxy: /piston/*  ->  http://170.64.241.58/api/v2/*
app.use(
  "/piston",
  createProxyMiddleware({
    target: "http://170.64.241.58/api/v2",
    changeOrigin: true,
    xfwd: true,
    // /piston/execute -> /execute (final URL becomes .../api/v2/execute)
    pathRewrite: { "^/piston/?": "/" },
    // code execution can take a bit; don’t prematurely time out
    timeout: 60_000,
    proxyTimeout: 60_000,
    // helpful diagnostics
    logLevel: "debug",
    onProxyReq: (_proxyReq, req) => {
      console.log(`[proxy] → ${req.method} ${req.originalUrl}`);
    },
    onError: (err, req, res) => {
      console.error("[proxy error]", req.method, req.originalUrl, err?.message);
      res.status(502).json({ message: "Proxy error", error: err?.message });
    },
  }),
);

// Health check
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// IMPORTANT: keep any catch-all 404 AFTER the proxy
app.use((req, res) => {
  res
    .status(404)
    .json({ message: "Not Found (app fallback)", url: req.originalUrl });
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => console.log(`Listening on ${port}`));
