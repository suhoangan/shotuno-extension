import type { Region } from './checkRegionOverlap';

export interface PageRegion {
  x: number; // document-space X (pageX)
  y: number; // document-space Y (pageY)
  w: number;
  h: number;
}

export function viewportToDocument(
  rect: { left: number; top: number; width: number; height: number },
  scrollPos?: { x: number; y: number }
): PageRegion {
  const sx = scrollPos ? scrollPos.x : (typeof window !== 'undefined' ? window.scrollX : 0);
  const sy = scrollPos ? scrollPos.y : (typeof window !== 'undefined' ? window.scrollY : 0);
  return {
    x: rect.left + sx,
    y: rect.top + sy,
    w: rect.width,
    h: rect.height,
  };
}

/**
 * Converts a document-space region back to viewport-space coordinates.
 */
export function documentToViewport(
  region: PageRegion | Region,
  scrollPos?: { x: number; y: number }
): { x: number; y: number; width: number; height: number } {
  const sx = scrollPos ? scrollPos.x : (typeof window !== 'undefined' ? window.scrollX : 0);
  const sy = scrollPos ? scrollPos.y : (typeof window !== 'undefined' ? window.scrollY : 0);
  return {
    x: region.x - sx,
    y: region.y - sy,
    width: region.w,
    height: region.h,
  };
}

