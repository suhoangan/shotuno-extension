/**
 * Content-script entry — keep this file free of Konva/React so a second
 * inject (HMR / executeScript) does not evaluate another Konva copy.
 */
const g = globalThis as typeof globalThis & { __SHOTUNO_CS__?: boolean };

if (!g.__SHOTUNO_CS__) {
  // Only mark loaded after bootstrap resolves — a failed chunk load after
  // rebuild must allow executeScript / refresh to retry.
  g.__SHOTUNO_CS__ = true;
  void import('./bootstrap').catch((err) => {
    g.__SHOTUNO_CS__ = false;
    console.error('[shotuno] content bootstrap failed', err);
  });

  // Listen to web app messages for auth sync (bypassing NEXT_PUBLIC_EXTENSION_ID requirement)
  window.addEventListener('message', (event) => {
    if (event.source !== window || !event.data) return;

    // Verify origin matches web application domains
    const origin = event.origin;
    const validOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ];
    
    // We can't import WEB_BASE directly here without pulling in other modules,
    // so we verify it's either localhost or production shotuno.com (which can be extended)
    const isProduction = origin === 'https://shotuno.com' || origin.endsWith('.shotuno.com');
    if (!validOrigins.includes(origin) && !isProduction) return;

    if (event.data.type === 'SHOTUNO_WEB_LOGIN' && event.data.token) {
      chrome.runtime.sendMessage({
        type: 'LOGIN_SYNC',
        token: event.data.token,
        user: event.data.user,
      }).catch(() => {});
    } else if (event.data.type === 'SHOTUNO_WEB_LOGOUT') {
      chrome.runtime.sendMessage({
        type: 'LOGOUT_SYNC',
      }).catch(() => {});
    }
  });
}
