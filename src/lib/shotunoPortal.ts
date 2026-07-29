/** Portal target for dialogs/menus — prefer shadow app so page CSS cannot style them. */
export function getShotunoPortalContainer(): HTMLElement | undefined {
  if (typeof document === 'undefined') return undefined;
  const shadowApp = document
    .getElementById('shotuno-root')
    ?.shadowRoot
    ?.getElementById('shotuno-app-container');
  if (shadowApp) return shadowApp;
  // Side panel / dashboard / popup (no content-script shadow host)
  return document.body;
}
