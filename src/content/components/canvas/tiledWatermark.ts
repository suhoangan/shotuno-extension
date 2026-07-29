/** Layout helpers for diagonal tiled text watermarks (shared by stage + export). */

export const WATERMARK_TILE_ANGLE = -45;
/** Lower than single-corner mark — tiles cover the whole canvas. */
export const WATERMARK_TILE_OPACITY = 0.22;
export const WATERMARK_TILE_FONT_SIZE = 18;
/** Horizontal gap as a multiple of measured text width. */
export const WATERMARK_TILE_GAP_X = 2.4;
/** Vertical gap as a multiple of font size. */
export const WATERMARK_TILE_GAP_Y = 3.2;

export function measureWatermarkText(text: string, fontSize: number): { width: number; height: number } {
  if (typeof document === 'undefined') {
    return { width: Math.max(40, text.length * fontSize * 0.55), height: fontSize };
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { width: Math.max(40, text.length * fontSize * 0.55), height: fontSize };
  }
  ctx.font = `${fontSize}px sans-serif`;
  return { width: Math.max(24, ctx.measureText(text).width), height: fontSize };
}

/** Staggered grid positions in local content coordinates (origin = content top-left). */
export function tiledWatermarkPositions(
  contentWidth: number,
  contentHeight: number,
  stepX: number,
  stepY: number,
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  if (stepX <= 0 || stepY <= 0 || contentWidth <= 0 || contentHeight <= 0) return positions;

  const cols = Math.ceil(contentWidth / stepX) + 2;
  const rows = Math.ceil(contentHeight / stepY) + 2;
  for (let row = -1; row <= rows; row++) {
    const stagger = row % 2 === 0 ? 0 : stepX / 2;
    for (let col = -1; col <= cols; col++) {
      positions.push({
        x: col * stepX + stagger,
        y: row * stepY,
      });
    }
  }
  return positions;
}
