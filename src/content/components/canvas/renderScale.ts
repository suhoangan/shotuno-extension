import Konva from 'konva';

/**
 * Konva keeps a scene canvas and a hit canvas for every layer, plus one buffer pair on the
 * stage itself, and resizes all of them whenever the stage size changes. That works out to
 * ~40 bytes of bitmap per stage pixel across four layers, so it is the stage's pixel count —
 * not the shape count — that decides how much memory the editor holds.
 *
 * Zoom therefore must not drive the stage size directly: a 4K capture at 5x would ask for a
 * 19200x10800 stage. `getRenderScale` returns the scale the stage rasterises at, capped by a
 * pixel budget. The gap between it and the visual zoom is taken up by a CSS transform on the
 * stage wrapper, which the compositor handles for free.
 */

// Konva otherwise multiplies every scene canvas by devicePixelRatio on its own. Folding
// rasterisation density into renderScale instead keeps one number in charge of bitmap size.
Konva.pixelRatio = 1;

/** ~480 MB of canvas bitmaps, and far below Chrome's ~268M px limit for a single canvas. */
export const MAX_STAGE_PIXELS = 12_000_000;

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const WHEEL_ZOOM_STEP = 1.1;
export const BUTTON_ZOOM_STEP = 1.25;

/**
 * Density the stage rasterises at for a given visual zoom. Matches `scale * devicePixelRatio`
 * — the density Konva would have picked — until the budget binds, after which the view is
 * upscaled rather than rasterised at full size.
 */
export function getRenderScale(stageWidth: number, stageHeight: number, scale: number): number {
  const area = stageWidth * stageHeight;
  if (!(area > 0)) return scale;
  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
  return Math.min(scale * dpr, Math.sqrt(MAX_STAGE_PIXELS / area));
}
