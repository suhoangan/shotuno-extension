export interface Region {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Checks if a proposed rectangle overlaps with any existing region.
 * Uses AABB (Axis-Aligned Bounding Box) collision detection.
 */
export function checkRegionOverlap(
  newRect: { x: number; y: number; w: number; h: number },
  regions: Region[],
  ignoreId?: string,
): boolean {
  for (const region of regions) {
    if (ignoreId && region.id === ignoreId) continue;
    
    // AABB collision logic: 
    // Two rectangles overlap if they overlap on both the X and Y axes.
    // They do NOT overlap if one is completely to the left, right, top, or bottom of the other.
    // Also, handle the case where width/height might be negative (though we shouldn't have that here)
    const r1Left = Math.min(newRect.x, newRect.x + newRect.w);
    const r1Right = Math.max(newRect.x, newRect.x + newRect.w);
    const r1Top = Math.min(newRect.y, newRect.y + newRect.h);
    const r1Bottom = Math.max(newRect.y, newRect.y + newRect.h);

    const r2Left = Math.min(region.x, region.x + region.w);
    const r2Right = Math.max(region.x, region.x + region.w);
    const r2Top = Math.min(region.y, region.y + region.h);
    const r2Bottom = Math.max(region.y, region.y + region.h);

    if (
      r1Left < r2Right &&
      r1Right > r2Left &&
      r1Top < r2Bottom &&
      r1Bottom > r2Top
    ) {
      return true; // Overlap detected
    }
  }
  return false;
}
