# 🎬 BBDown Web

A pure browser-based Bilibili (哔哩哔哩) video downloader. No server needed - runs entirely in your browser!

![License](https://img.shields.io/badge/license-MIT-blue)
![GitHub Pages](https://img.shields.io/badge/deploy-GitHub%20Pages-brightgreen)

## ✨ Features

- 🌐 **100% Browser-Based** - No backend server required
- 🔐 **QR Code Login** - Scan with Bilibili mobile app (Web & TV login)
- 📺 **Interactive Quality Selection** - Choose from all available qualities (8K, 4K, 1080P, HDR, Dolby Vision)
- 🎵 **Audio Quality Options** - Standard, Dolby Atmos, Hi-Res FLAC
- 🔄 **Auto Merge** - Video + Audio merged in browser via ffmpeg.wasm
- 📝 **Subtitles & Danmaku** - Download subtitles and bullet comments
- 🎨 **Beautiful Dark UI** - Modern design with Bilibili pink accents
- 🆓 **Free Hosting** - Deploy on GitHub Pages, Netlify, or any static host
- 🔒 **Privacy** - Your credentials stay in YOUR browser (localStorage)

## 🚀 Live Demo

**[https://hussain301.github.io/Bbdown-web/](https://hussain301.github.io/Bbdown-web/)**

## 📖 How It Works

```
Your Browser → Cloudflare Worker (free CORS proxy) → Bilibili APIs
                                                    ↓
Your Browser ← Video/Audio streams ← Bilibili CDN
                    ↓
            ffmpeg.wasm (merge in browser)
                    ↓
            Save to your PC 💾
```

## 🛠️ Setup

### 1. Deploy the CORS Proxy (one-time, free)
```bash
cd worker
npm install
npx wrangler login    # Create free Cloudflare account
npx wrangler deploy   # Deploy proxy worker
# You'll get a URL like: https://bbdown-proxy.YOUR_NAME.workers.dev
```

### 2. Deploy the Web App

**Option A: GitHub Pages (automatic)**
- Push to GitHub → Auto-deploys via GitHub Actions
- Enable Pages in Settings → Source: GitHub Actions

**Option B: Any Static Hosting**
```bash
cd BBDown.Web
npm install
npm run build
# Upload dist/ folder to any hosting
```

**Option C: Local Development**
```bash
cd BBDown.Web
npm install
npm run dev
# Open http://localhost:5173
```

### 3. Configure
- Open the web app
- Go to Settings → Enter your Cloudflare Worker URL
- Go to Login → Scan QR code with Bilibili app
- Done! Start downloading! 🎉

## 📋 Usage

1. **Login**: Go to Login page → Generate QR → Scan with Bilibili app
2. **Download**: Paste any Bilibili URL → Select quality → Click Download
3. **Save**: When merge completes → Click 'Save to PC'

## 🔗 Supported URLs

- `https://www.bilibili.com/video/BVxxxxxxxxxx`
- `https://www.bilibili.com/video/avxxxxxxx`
- `https://www.bilibili.com/bangumi/play/epxxxxxx`
- `https://www.bilibili.com/bangumi/play/ssxxxxxx`
- `https://b23.tv/xxxxxx`
- Plain IDs: `BV1xx411c7mD`, `av12345`, `ep12345`, `ss12345`

## 🏗️ Architecture

- **Frontend**: React + TypeScript + TailwindCSS + Vite
- **CORS Proxy**: Cloudflare Worker (free 100k req/day)
- **Video Processing**: ffmpeg.wasm (runs in browser)
- **Hosting**: Any static file host (GitHub Pages, Netlify, etc.)

## ⚠️ Disclaimer

This tool is for personal study and research purposes only. Please respect copyright laws and Bilibili's terms of service.

## 📄 License

MIT License - Based on [BBDown](https://github.com/nilaoda/BBDown) by nilaoda
