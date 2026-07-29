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
}
