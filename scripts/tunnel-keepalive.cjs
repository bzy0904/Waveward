#!/usr/bin/env node
/**
 * localtunnel 自动保活：断线后自动重连，并打印最新公网 URL
 */
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const PORT = process.env.PORT || "3001";
const LT_BIN = path.join(__dirname, "..", "node_modules", "localtunnel", "bin", "lt.js");
const LOG_FILE = path.join(__dirname, "..", ".tools", "tunnel-url.txt");

let currentUrl = null;
let restarting = false;

function startTunnel() {
  console.log(`[${new Date().toISOString()}] 启动 localtunnel，端口 ${PORT}...`);
  const child = spawn(process.execPath, [LT_BIN, "--port", PORT], {
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (data) => {
    const text = data.toString();
    process.stdout.write(`[lt] ${text}`);
    const match = text.match(/your url is:\s*(https:\/\/[^\s]+\.loca\.lt)/);
    if (match) {
      currentUrl = match[1];
      fs.writeFileSync(LOG_FILE, currentUrl, "utf8");
      console.log(`\n[${new Date().toISOString()}] ✓ 公网 URL: ${currentUrl}\n`);
    }
  });

  child.stderr.on("data", (data) => {
    process.stderr.write(`[lt:err] ${data}`);
  });

  child.on("exit", (code) => {
    console.log(`[${new Date().toISOString()}] localtunnel 退出，code=${code}，5 秒后重启...`);
    if (!restarting) {
      restarting = true;
      setTimeout(() => {
        restarting = false;
        startTunnel();
      }, 5000);
    }
  });
}

startTunnel();

// 优雅退出
process.on("SIGINT", () => {
  console.log("\n正在停止...");
  process.exit(0);
});
