# Chrome Web Store — Permission justifications

Paste into the dashboard when prompted for each permission / host access. Keep answers factual and tied to the **single purpose**: capture + annotate screenshots in Chrome.

---

## Single purpose

```
Capture screenshots (visible, area, or full page) and annotate them in the browser, including a local pins/gallery library and user-initiated export (copy, download, or send to a destination the user chooses).
```

---

## `activeTab`

```
Used when the user starts a capture from the toolbar popup so Shotuno can access the current tab and begin screenshot capture / open the in-page editor.
```

---

## `tabs`

```
Used to identify the active tab for capture, open/focus the correct tab when injecting the editor or AI image flow, and coordinate capture across the tab lifecycle (including full-page scroll capture).
```

---

## `scripting`

```
Injects and updates the content script / in-page annotation editor on the tab the user is capturing, and supports capture flows that need a scripted overlay (area select, full-page stitch UI).
```

---

## `storage` + `unlimitedStorage`

```
Stores pins, gallery/download metadata, editor preferences, and image data locally on the user’s device. unlimitedStorage is required because screenshot and pin image payloads can exceed the default chrome.storage quota.
```

---

## `downloads`

```
Saves annotated screenshots (and related images) to the user’s Downloads folder when they choose Download in the editor or library.
```

---

## `sidePanel`

```
Hosts the Pins & Downloads library so users can browse saved captures and drag them onto pages without leaving Chrome.
```

---

## `debugger`

```
Used only when the user chooses Full Page capture, to take a DevTools-style full-size screenshot of the active tab via the Chrome DevTools Protocol (Page.captureScreenshot with captureBeyondViewport). The debugger attaches briefly for that capture and detaches immediately after. It is not used for remote debugging, network interception, or inspecting other sites in the background. If attach fails (for example DevTools already open), Shotuno falls back to scroll-and-stitch capture.
```

---

## Host permission: `<all_urls>` / content scripts on all sites

```
Shotuno’s editor is an in-page overlay and capture (including full-page stitch and area select) must work on whatever normal website the user is viewing. Host access is used only after the user initiates capture or opens the editor — not to scrape or sell browsing data.
```

---

## Host permission: marketing site origin (when `VITE_WEB_URL` is a public URL)

```
Allows opening support / Buy me a coffee links on the official Shotuno website from the extension UI.
```

---

## Content script on `https://gemini.google.com/*` (MAIN world bridge)

```
Used only when the user chooses to send an image to Gemini, so Shotuno can hand off the image into the Gemini page UI the user already opened. Not used for unrelated page scraping.
```

---

## Remote code

```
Shotuno does not execute remote code. All extension logic ships inside the package uploaded to the Chrome Web Store.
```

*(If asked about WASM/OCR: Tesseract.js / traineddata ships with or is loaded as packaged assets for on-device OCR — not remote arbitrary JS.)*

---

## User data checklist (Privacy practices tab)

| Question | Recommended answer |
| --- | --- |
| Does the extension collect user data? | **Yes** — handles screenshots/pins the user creates (stored locally). No remote crash reporting or analytics. |
| Personally identifiable information | **No** (no account). |
| Health / financial / auth credentials | **No**. |
| Personal communications | **No**. |
| Location | **No**. |
| Web history | **No** (does not collect browsing history; operates on the active page only when the user captures). |
| User activity | **No** — no analytics or crash telemetry. |
| Website content | **Yes** — page pixels the user captures become a screenshot they edit/store locally. |
| Sell data to third parties | **No**. |
| Use data for unrelated purposes | **No** — Limited Use. |
| Transfer to third parties | Only when **user-initiated** (e.g. open Gemini, open payment/support site). |
| Privacy policy URL | https://shotuno.suhoangan.com/policy |
