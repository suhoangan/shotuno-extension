/**
 * MAIN-world page bridge (manifest `world: "MAIN"`).
 *
 * This file is injected into the page JS context — not the isolated content-script
 * world — so it can patch DOM APIs that Gemini binds in-page
 * (`HTMLInputElement.prototype.click`). The isolated content script talks to it
 * via `window.postMessage` with source `shotuno-bridge`.
 *
 * Do not import React or extension APIs here; they are unavailable in MAIN world.
 */
(() => {
  const SOURCE = 'shotuno-bridge';
  let originalClick: typeof HTMLInputElement.prototype.click | null = null;

  window.addEventListener('message', (event: MessageEvent) => {
    if (event.source !== window) return;
    if (event.origin !== 'https://gemini.google.com' && event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || data.source !== SOURCE) return;

    if (data.type === 'patch-file-click') {
      if (originalClick) return;
      originalClick = HTMLInputElement.prototype.click;
      HTMLInputElement.prototype.click = function (this: HTMLInputElement) {
        if (this.type === 'file') return;
        return originalClick!.call(this);
      };
      return;
    }

    if (data.type === 'restore-file-click' && originalClick) {
      HTMLInputElement.prototype.click = originalClick;
      originalClick = null;
    }
  });
})();
