/**
 * 全媒体运营师刷题工具 — 桌面版 (轻量本地服务器)
 * 启动后自动打开浏览器，无需 Electron，零依赖
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon',
};

const server = http.createServer((req, res) => {
  let filePath = path.join(ROOT, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } else {
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    }
  });
});

// 获取本机局域网 IP
const os = require('os');
const ifaces = os.networkInterfaces();
let localIP = 'localhost';
for (const name of Object.keys(ifaces)) {
  for (const iface of ifaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      localIP = iface.address; break;
    }
  }
  if (localIP !== 'localhost') break;
}

// 绑定到所有网卡，允许手机等设备访问
server.listen(PORT, '0.0.0.0', () => {
  const urls = [
    `http://localhost:${PORT}`,
    `http://${localIP}:${PORT}`,
  ];
  console.log(`\n  📱 全媒体运营师刷题工具 桌面版`);
  console.log(`  ─────────────────────────────`);
  console.log(`  本机访问:  ${urls[0]}`);
  console.log(`  手机访问:  ${urls[1]}`);
  console.log(`  (确保手机和电脑在同一 WiFi)`);
  console.log(`  按 Ctrl+C 停止\n`);

  // 自动打开浏览器
  const cmd = process.platform === 'darwin' ? 'open' :
              process.platform === 'win32' ? 'start' : 'xdg-open';
  exec(`${cmd} ${urls[0]}`);
});
