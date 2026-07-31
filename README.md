# Shotuno Chrome extension

Capture and annotate screenshots in-tab (visible, area, full page, pins).

## Develop

```bash
npm install
npm run dev
```

Load unpacked from `dist/` (or follow Vite + CRX HMR on port 5173) at `chrome://extensions`.

## Production build / Chrome Web Store

```bash
npm run build
npm run package:store
```

Store listing copy, privacy policy text, permission justifications, and asset checklist live in [`store-listing/`](./store-listing/PUBLISH.md).

Manifest source: [`manifest.config.ts`](./manifest.config.ts).
