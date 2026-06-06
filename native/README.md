# AI训练师 · 刷题 — 原生 App 打包

本目录包含将刷题 PWA 打包为 iOS/Android 原生 App 的全部配置。

## 方式一：PWABuilder（免费 · 最简单 ✅ 推荐）

[PWABuilder](https://pwabuilder.com) 是微软提供的免费 PWA 打包服务，无需安装任何工具。

### 步骤：

1. **先将 `www/` 目录部署到公网**
   ```bash
   # 方式 A：上传到 GitHub Pages（免费）
   # 方式 B：用 ngrok 临时暴露本地服务
   brew install ngrok
   cd www/ && python3 -m http.server 8080 &
   ngrok http 8080
   ```

2. **打开** https://pwabuilder.com

3. **输入你的 PWA 网址**，点击 "Start"

4. **生成 iOS 包**：
   - 点击 iOS → "Store Package"
   - 下载 `.ipa` 文件
   - 用 Apple Configurator 或 Xcode 安装到 iPhone

5. **生成 Android 包**：
   - 点击 Android → "Package"
   - 下载 `.apk` 或 `.aab`

## 方式二：Capacitor 本地打包

需要安装 Xcode（仅 iOS）和 Node.js。

```bash
# 1. 安装依赖
npm install

# 2. 添加 iOS 平台
npx cap add ios

# 3. 同步 web 文件
npx cap sync

# 4. 打开 Xcode 编译
npx cap open ios
```

## 方式三：Ionic AppFlow 云端打包

1. 将代码推送到 GitHub/GitLab
2. 在 https://ionic.io/appflow 创建账号（免费 1 次/月）
3. 连接仓库，自动云端编译 iOS/Android

## 目录结构

```
native/
├── www/                    # PWA 源文件
│   ├── index.html          # 主应用
│   ├── question_bank.json  # 900 道题库
│   ├── manifest.json       # PWA 配置
│   └── sw.js               # Service Worker
├── capacitor.config.json   # Capacitor 配置
├── package.json            # Node.js 依赖
└── README.md               # 本文件
```
