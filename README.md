# Shotuno — Open Source Chrome Screenshot & Annotation Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-blue.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)](https://www.typescriptlang.org/)
[![Privacy: 100% Local](https://img.shields.io/badge/Privacy-100%25%20Local-brightgreen.svg)](#privacy-guarantee)

> **Shotuno** is a lightning-fast, 100% free and open-source Chrome extension for capturing, annotating, and redacting screenshots directly in your browser. All tools, 4K UHD exports, and on-device OCR are completely unlocked with zero paywalls, zero accounts, and zero cloud tracking.

---

## Features

### 📸 Versatile Capture Modes
- **Visible Content**: Instantly capture what's visible in your viewport.
- **Selected Area**: Drag to capture any specific region with pixel precision.
- **Full Page Scroll**: Automatically stitches vertically scrolling web pages.
- **Smart Grid Capture**: Select and extract individual grid or bento components.
- **Local Image Import**: Open existing image files from your computer into the editor.

### 🎨 Rich In-Tab Annotation Canvas
- **Shapes & Arrows**: Draw crisp arrows, rectangles, ellipses, and callout lines.
- **Step Badges**: Click to place auto-incrementing numbered circular badges (1, 2, 3...).
- **Text & Highlighting**: Add bold text annotations and dim out non-essential areas.
- **Freehand Pen**: Natural brush drawing with configurable thickness and colors.
- **Crop & Resize**: Crop canvas freely or resize to standard aspect ratios and 4K resolutions.

### 🛡️ Local OCR & Smart Privacy Redaction
- **On-Device OCR**: Extracts text from any screenshot region using Tesseract.js directly inside your browser.
- **Smart Redaction / Auto-Blur**: 1-click automatic detection and blurring of sensitive data (passwords, emails, phone numbers, API keys).
- **Manual Blur**: Freehand or box blur for covering confidential details before sharing.

### 📌 Floating Pins & Side Panel Library
- **Auto-Pin**: Pin any screenshot as a floating, resizable overlay on top of any webpage.
- **Side Panel Library**: Drag and drop previously captured images directly into email, Slack, Notion, or ChatGPT.
- **1-Click Copy & Export**: Instant clipboard copy or download in PNG, JPG, or WebP.

---

## Privacy Guarantee

Shotuno was built from the ground up to respect user privacy:
- **Zero Cloud Servers**: Shotuno has no backend API, no cloud database, and no telemetry tracking.
- **100% Local Execution**: Image rendering (Konva), OCR (Tesseract.js), and regex blurring execute strictly on your device.
- **Minimal Permissions**: No cookie-reading permissions and no external web domain connections. Your screenshots never leave your browser.

---

## Getting Started & Development

### Prerequisites
- Node.js 20+
- npm 10+

### 1. Clone & Install
```bash
git clone https://github.com/suhoangan/shotuno-extension.git
cd shotuno-extension
npm install
```

### 2. Start Development Mode
```bash
npm run dev
```
This builds into `dist/` with live Hot Module Reloading (HMR) powered by Vite and CRXJS.

### 3. Load into Chromium Browsers (Chrome, Edge, Brave, Arc)
1. Open your browser and navigate to `chrome://extensions/`.
2. Toggle **Developer mode** on in the top-right corner.
3. Click **Load unpacked** and select the `dist/` folder inside this directory.
4. Pin the Shotuno icon to your toolbar and start capturing!

### 4. Production Build & Release Package
```bash
# Builds optimized production bundle
npm run build

# Package extension zip for release or store distribution
npm run release
```
The packaged archive will be generated in `release/shotuno-1.0.2.zip`.

---

## Architecture Overview

```
src/
├── background/         # MV3 Service Worker (capture, tabs, downloads, side panel)
├── content/            # In-page overlay editor (React + Konva + Shadow DOM container)
│   ├── components/     # Canvas, Toolbar, Crop, AI Prompts, Watermarks
│   └── utils/          # Local OCR (Tesseract), Smart Blur regex, image processing
├── popup/              # Browser action popup (Quick capture mode picker)
├── sidepanel/          # Side panel gallery, pin history, and drag-and-drop shelf
├── onboarding/         # Full-tab User Guide, About Developer, and Settings hub
├── components/ui/      # Accessible UI components (@base-ui/react + Tailwind tokens)
└── store/              # State management (Zustand)
```

- **Shadow DOM Isolation**: All in-page editor components mount inside `#shotuno-root` closed Shadow DOM to guarantee zero CSS conflicts with host web pages.
- **Strict File Modularity**: All source files adhere to a 250-line ceiling for maintainability and clean separation of concerns.

---

## Creator & Community

- **Created by**: Hoang An Su ([@suhoangan](https://github.com/suhoangan))
- **Repository**: [https://github.com/suhoangan/shotuno-extension](https://github.com/suhoangan/shotuno-extension)
- **Issues & Suggestions**: [Report an issue](https://github.com/suhoangan/shotuno-extension/issues)

If you find Shotuno helpful for your daily workflow, please consider starring the repository on GitHub! ⭐

---

## License

This project is open source and available under the [MIT License](LICENSE).
