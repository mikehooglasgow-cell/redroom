import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 1. 核心 API 路由
app.get("/api/health", (_req, res) => {
  res.json({ 
    status: "ok", 
    mode: process.env.NODE_ENV || "development", 
    timestamp: new Date().toISOString() 
  });
});

// 2. 静态文件与前端托管桥接逻辑（已精准对齐 dist/public 目录）
const publicPath = path.resolve(__dirname, "../dist/public");

if (fs.existsSync(publicPath)) {
  // 生产模式：托管打包后的静态前端资源
  app.use(express.static(publicPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(publicPath, "index.html"));
  });
} else {
  // 兜底提示页面
  app.get("/", (_req, res) => {
    res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h2>Redroom 后端服务运行正常 🚀</h2>
        <p>当前未检测到完整的前端打包产物。</p>
        <p>请先在终端运行 <b>pnpm build</b>，然后再启动服务。</p>
        <a href="/api/health" style="color: #007bff; text-decoration: none;">查看 API 健康状态</a>
      </div>
    `);
  });
}

const port = 3000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running smoothly on http://localhost:${port}`);
});