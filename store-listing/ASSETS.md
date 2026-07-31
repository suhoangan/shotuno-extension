# Chrome Web Store — Image & asset checklist

Place final binary assets in this folder when ready (do not commit huge WIP dumps). Icons already ship from `public/`.

## Required

| Asset | Size | Format | Notes | Status |
| --- | --- | --- | --- | --- |
| Store icon | **128×128** | PNG | Use `public/icon-128.png` (already in package) | Ready in package |
| Screenshots | **1280×800** (preferred) or 640×400 | PNG/JPEG | Full bleed, square corners, no padding; **1–5** images | Ready: 5 screenshots in `assets/` |
| Small promo tile | **440×280** | PNG/JPEG | Required for store promotion | Ready: `assets/promo-small-440x280.png` |

## Optional but recommended

| Asset | Size | Format | Notes |
| --- | --- | --- | --- |
| Marquee promo | **1400×560** | PNG/JPEG | Needed to be featured in marquee | Ready: `assets/promo-marquee-1400x560.png` |
| YouTube promo video | — | YouTube URL | Demo: capture → annotate → export |

## Suggested screenshot set (5)

Shoot real UI (not mockups) at 1280×800:

1. **Popup** — Capture Mode list (Visible / Area / Full / Pin)
2. **In-page editor** — annotated screenshot with arrows + blur
3. **Full-page or area capture** mid-flow (selection overlay)
4. **Side panel** — Pins & Downloads library
5. **OCR or magnifier** — one “power tool” moment

Tips from Chrome docs:

- Prefer fewer words on the image
- Show current UI matching v1.0.0
- Avoid fake 5-star badges or misleading before/after claims

## Promo tile concept

- Brand wordmark **Shotuno**
- Tagline: *Capture. Mark up. Stay in the tab.*
- One product visual (editor overlay), no cluttered icon rows
- Avoid generic purple-gradient AI look; match Shotuno brand tokens from the extension

## Files to add here later

```
store-listing/assets/
  screenshot-01-popup.png
  screenshot-02-editor.png
  screenshot-03-capture.png
  screenshot-04-sidepanel.png
  screenshot-05-tools.png
  promo-small-440x280.png
  promo-marquee-1400x560.png
```
