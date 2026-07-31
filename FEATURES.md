# Shotuno — Product Feature Brief

> Use this file as the source of truth when prompting another agent to design **onboarding / intro / marketing UI** for the Shotuno Chrome extension.
> Product brand is **Shotuno** (not “Capture all” — that name is OAuth-only).

---

## One-liner

**Shotuno** is a Chrome extension that lets you capture screenshots (visible, area, or full page), annotate them on an in-page canvas without leaving the tab, then copy, download, pin, or send to AI.

## Tagline (existing)

> Capture. Mark up. Stay in the tab.

## Positioning

- Native-in-browser: editor overlays the current page (Shadow DOM) — no separate desktop app
- Capture → annotate → export in one flow
- Side panel library (Pins + Downloads) for reuse and drag onto web pages
- **Free forever. No account.** Optional tip via Buy me a coffee (web `/#buy-me-a-coffee` → Gumroad / VietQR)
- Offline extension: all tools always on; no Nest/API calls; no crash reporting / analytics
- Admin feature flags on the website are unused by the extension

---

## Surfaces (where users interact)

| Surface | What it is |
| --- | --- |
| **Toolbar popup** | Capture modes + open library + open local image + Buy me a coffee |
| **In-page editor** | Full annotation canvas on the current tab (BMC bottom-right) |
| **Chrome side panel** | Pins & Downloads library (BMC footer) |
| **Onboarding / options page** | Welcome / how to start |
| **Extension dashboard** | Guest tips — no login |
| **Marketing website** | Landing + support section (no consumer login) |
| **Admin (web)** | Ops-only login; extension feature toggles |

---

## Monetization

- Product is free; no Pro paywall
- Extension CTAs open `WEB/#buy-me-a-coffee`
- Web section: Support $5+ (Gumroad `zzgfgk`) + Quét VietQR (Techcombank)

---

## Core capture features

1. **Visible Content** — Capture what is on screen right now
2. **Selected Area** — Drag a region to crop, then edit
3. **Full Page** — Scroll and stitch the entire page
4. **Pin area** — Capture a region and save it to the side panel for reuse on any tab
5. **Open image** — Load a local image file into the in-page editor

All tools are free when enabled by admin feature flags.
