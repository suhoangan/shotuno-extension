# Publish Shotuno to the Chrome Web Store

Checklist to go from this repo to a public listing.

## 0. Before you build

1. Set production env in `shotuno-extension/.env` (or CI secrets):

```env
VITE_WEB_URL=https://shotuno.suhoangan.com
```

2. Host **privacy policy** at https://shotuno.suhoangan.com/policy (copy from `PRIVACY_POLICY.md`).
3. Capture store screenshots + promo tiles (`ASSETS.md`).
4. Confirm icons in `public/icon-{16,32,48,128}.png` look sharp on light and dark toolbars.

**Do not upload a build that still lists `http://localhost:3001/*` in `host_permissions`.** Production mode omits localhost automatically when `VITE_WEB_URL` is unset or local.

## 1. Build & package

From `extension/`:

```bash
npm run publish
# (Runs build and packages into release/shotuno-1.0.0.zip)
```

This produces `extension/release/shotuno-1.0.0.zip` from `dist/` (manifest + assets only — no `node_modules`, no `.env`).

Manual zip (PowerShell) if needed:

```powershell
Compress-Archive -Path dist\* -DestinationPath release\shotuno-1.0.0.zip -Force
```

Load `dist/` unpacked at `chrome://extensions` and smoke-test:

- [ ] Visible / area / full / pin capture
- [ ] Annotate + copy + download
- [ ] Side panel pins & gallery
- [ ] Open image
- [ ] Onboarding options page
- [ ] No capture on `chrome://` pages (expected error)
- [ ] Inspect `dist/manifest.json` — no localhost hosts; version `1.0.0`

## 2. Developer Dashboard

1. Open [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. Pay the one-time developer registration fee if needed
3. **New item** → upload `shotuno-1.0.0.zip`
4. Fill **Store listing** from `LISTING.md`
5. Upload screenshots + small promo tile from `ASSETS.md`
6. Fill **Privacy practices** using `PERMISSION_JUSTIFICATIONS.md`
7. Set privacy policy URL to your hosted policy
8. Distribution: public (or unlisted for soft launch)
9. Submit for review

## 3. Review tips

- Justification for `<all_urls>` is the in-page editor + capture on arbitrary sites — say that clearly.
- Do not claim features you do not ship (no account/paywall if product is free).
- Brand is **Shotuno** everywhere; “Capture all” is only the Google Cloud OAuth consent app name if you still use that project for anything else.
- After approval, bump `version` in `manifest.config.ts` (and `package.json`) for every new upload — Chrome requires a higher version each time.

## 4. Post-publish

- Save the extension ID; set `NEXT_PUBLIC_EXTENSION_ID` on the marketing site if you deep-link install.
- Keep `store-listing/` copy in sync when permissions or data practices change.
- Re-run `npm run publish` for each release.
