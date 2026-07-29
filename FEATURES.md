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
- Pro / trial unlocks advanced tools (OCR, smart blur, watermark, send to AI)

---

## Surfaces (where users interact)

| Surface | What it is |
| --- | --- |
| **Toolbar popup** | Capture modes + open library + open local image |
| **In-page editor** | Full annotation canvas on the current tab |
| **Chrome side panel** | Pins & Downloads library |
| **Onboarding / options page** | Welcome / how to start |
| **Account dashboard** | Auth, Pro, Google Drive, support |
| **Marketing website** | Landing, pricing, login (syncs JWT to extension) |

---

## Core capture features

1. **Visible Content** — Capture what is on screen right now
2. **Selected Area** — Drag a region to crop, then edit
3. **Full Page** — Scroll and stitch the entire page
4. **Pin area** — Capture a region and save it to the side panel for reuse on any tab
5. **Open image** — Load a local image file into the in-page editor

---

## In-page annotation editor

Editor opens as an overlay on the current page. Floating toolbar + style controls + filename field.

### Navigation / selection

| Tool | Shortcut | Description |
| --- | --- | --- |
| Select | V | Select, move, resize annotations |
| Pan | H | Pan the canvas |

### Drawing & markup (free / core)

| Tool | Shortcut | Description |
| --- | --- | --- |
| Arrow / Line | A | Pointed arrows or plain lines; color, thickness, two-way, solid |
| Rectangle | R | Box highlight / frame |
| Circle | O | Ellipse / circle |
| Triangle | Y | Triangle shape |
| Text / Callout | T | Click to add text; callout with tail; edit inline |
| Brush | B | Freehand pen |
| Highlight | Shift+H | Semi-transparent highlighter stroke |
| Counter marker | C | Numbered step markers (circle / square / waterpoint styles) |
| Stickers | — | Emoji stickers (click or drag onto canvas) |
| Manual blur | S | Redact areas: pixelate, soft blur, or solid cover |
| Magnifier | Z | Loupe / zoom inset on part of the image |
| Measure | M | Distance / dimension ruler |
| Crop | Shift+C | Crop the screenshot |
| Resize | — | Resize the image canvas |

### Presentation chrome

| Feature | Description |
| --- | --- |
| **Window border & padding** | macOS or Windows frame; optional URL + date; gradient/solid padding presets (sunset, ocean, mint, white, slate, charcoal) |
| **Filename** | Rename before save (e.g. `Screenshot_2026-07-28.png`) |
| **Undo / Redo** | Full history for annotation actions (Ctrl+Z / Ctrl+Y) |
| **Zoom** | Zoom controls; canvas fits large captures |
| **Clear / delete** | Delete selected shapes or clear all annotations |

### Export & output

| Action | Description |
| --- | --- |
| **Copy to clipboard** | PNG to system clipboard |
| **Download / Save** | Download PNG with chosen filename |
| **Close** | Exit editor (Esc) |

---

## Pins & gallery (side panel library)

Opened from the popup (“Open pins & gallery”) or from an edge toggle in the editor.

### Pins tab

- Store area captures for reuse across tabs
- Grid / list view prefs
- Preview, rename, download, open on desktop
- Multi-select + bulk delete
- **Drag pins onto web pages** (e.g. drop into AI chat or forms)
- Import images into pins via drop
- Open a pin back into the editor

### Downloads tab

- Local history of saved screenshots (IndexedDB — not limited by chrome.storage 5MB)
- Same library actions: edit, preview, rename, download, delete
- Drag shots onto web pages

---

## Pro / premium features

Gated behind Pro plan, admin, or active trial. Paywall prompts sign-in / upgrade on the website.

| Feature ID | User-facing name | What it does |
| --- | --- | --- |
| `ocr` | OCR / Extract Text | Select a region and extract text from the image |
| `smart_blur` | Smart Blur | Auto-detect and blur sensitive data |
| `watermark` | Watermark | Text or image watermark overlay |
| `send_to_ai` | Smart Parse / Send to AI | Send annotated screenshot + prompt to an AI assistant |
| `send_to_saas` | Send to SaaS | Pro SaaS send path (admin-configurable) |

### Send to AI (Smart Parse)

- Custom prompt + quick presets: Explain, Extract Text, Find Bugs, To Tailwind
- Destinations:
  - **ChatGPT** (OpenAI)
  - **Claude** (Anthropic)
  - **Gemini** (Google)
  - **Cursor IDE** (copy for Composer)
  - **Copy Image & Prompt** (any other AI tool)

### Trial / account

- Free trial (date-based; marketing site says **7-day free trial**)
- Website login syncs JWT into the extension (`authToken` / `authUser` in `chrome.storage.local`)
- Google sign-in supported
- Optional Google Drive connect (dashboard) for cloud save / backup flows

---

## Account & dashboard (extension)

- Overview for signed-in user
- Premium / Pro gate for cloud features
- Google Drive connect
- Support request (email)
- Admin tools (users, Pro feature toggles) — internal, not for consumer intro UI

---

## Suggested feature groups for intro / onboarding UI

Use these as sections or carousel slides — ordered by user value:

1. **Capture without leaving the page** — Visible / Area / Full page
2. **Annotate like a pro** — Arrows, shapes, text callouts, highlight, counters, stickers
3. **Redact & polish** — Blur, smart blur, window border frames, watermark
4. **Pins & drag anywhere** — Pin areas, side panel library, drag into chats
5. **Send to AI in one click** — ChatGPT / Claude / Gemini / Cursor
6. **Copy or download instantly** — Clipboard + PNG save
7. **Start free** — Trial, then Pro for advanced tools

### Three-step “How it works” (already on marketing site)

1. Install & pin the extension
2. Capture (visible / area / full page)
3. Annotate on the in-page canvas, then save

---

## Brand & visual direction (for UI agents)

| Token | Value |
| --- | --- |
| Brand | Shotuno |
| Palette | Deep teal `#0B3D3A`, mist `#E8EEF2`, charcoal `#1A1F24`, coral `#E85D4C` |
| Mood | Crisp, modern, tool-like |
| Avoid | Purple gradients, cream/serif luxury, neon glow, generic AI-purple look |
| Mark | Capture-frame / shutter “S” monogram with coral corner bracket |

More branding prompts: `shotuno-web/branding/PROMPTS.md`

---

## Prompt starter for another agent

Copy/adapt:

```
Design an onboarding / intro UI for Shotuno, a Chrome screenshot + annotation extension.
Read FEATURES.md for the full feature list and brand palette.

Requirements:
- First viewport: brand “Shotuno” as hero, one headline, one short supporting line, one CTA (“Add to Chrome” / “Start capturing”), one dominant product visual (in-page editor or capture flow).
- Follow with short feature sections using the suggested groups (capture, annotate, pins, AI, export).
- Do not invent features not listed in FEATURES.md.
- Use the Shotuno palette (teal / mist / charcoal / coral). Avoid purple AI tropes.
- Mobile + desktop friendly.
```

---

## Out of scope for consumer intro UI

- Admin dashboard / Pro feature admin toggles
- Internal CSRF / API / Prisma details
- OAuth consent app name “Capture all”
- Incomplete / stub flows unless productized in UI (treat Drive as optional “cloud backup” if shown)
