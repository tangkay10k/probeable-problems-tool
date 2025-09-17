import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// Proxy /piston/* → http://170.64.241.58/api/v2/*
app.use(
  "/piston",
  createProxyMiddleware({
    target: "http://170.64.241.58",
    changeOrigin: true,
    pathRewrite: { "^/piston": "/api/v2" },
  }),
);

app.get("/", (req, res) => {
  res.send("Proxy service is running");
});

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Listening on ${port}`));
