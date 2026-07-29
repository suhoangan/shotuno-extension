export const STICKER_EMOJI_FONT =
  "sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'";

// Leaves a little room so the glyph never touches the transformer border
export const STICKER_GLYPH_RATIO = 0.78;

// Konva drops a whole line when it cannot fit the width it was given, and emoji
// advance widths run up to ~1.4em (wider than the square they are drawn in).
export const STICKER_GLYPH_BOX_EMS = 3;

const inkOffsets = new Map<string, number>();

type StickerCorner = 'tl' | 'tr' | 'bl' | 'br';

const OPPOSITE_CORNER: Record<string, StickerCorner> = {
  'top-left': 'br',
  'top-right': 'bl',
  'bottom-left': 'tr',
  'bottom-right': 'tl',
};

function inkOffsetEms(emoji: string) {
  const cached = inkOffsets.get(emoji);
  if (cached !== undefined) return cached;

  let offset = 0;
  const ctx = document.createElement('canvas').getContext('2d');
  if (ctx) {
    const size = 100;
    ctx.font = `${size}px ${STICKER_EMOJI_FONT}`;
    ctx.textBaseline = 'middle';
    const metrics = ctx.measureText(emoji);
    const ascent = metrics.actualBoundingBoxAscent;
    const descent = metrics.actualBoundingBoxDescent;
    if (Number.isFinite(ascent) && Number.isFinite(descent)) {
      offset = (descent - ascent) / 2 / size;
    }
  }

  inkOffsets.set(emoji, offset);
  return offset;
}

export const STICKER_MIN_SIZE = 20;

export function getStickerLayout(width: number, height: number, emoji: string) {
  const boxWidth = Math.max(1, width);
  const boxHeight = Math.max(1, height);
  const fontSize = Math.max(4, Math.min(boxWidth, boxHeight) * STICKER_GLYPH_RATIO);
  const glyphBox = fontSize * STICKER_GLYPH_BOX_EMS;

  return {
    width: boxWidth,
    height: boxHeight,
    fontSize,
    glyphBox,
    textX: (boxWidth - glyphBox) / 2,
    textY: -inkOffsetEms(emoji) * fontSize,
  };
}

export function syncStickerNodes(
  group: { findOne: (selector: string) => any; clipWidth: (w: number) => void; clipHeight: (h: number) => void; width?: (w: number) => void; height?: (h: number) => void },
  width: number,
  height: number,
  emoji: string,
) {
  const layout = getStickerLayout(width, height, emoji);
  group.clipWidth(layout.width);
  group.clipHeight(layout.height);
  group.width?.(layout.width);
  group.height?.(layout.height);

  const rectNode = group.findOne('.sticker-bounds');
  if (rectNode) {
    rectNode.x(0);
    rectNode.y(0);
    rectNode.rotation(0);
    rectNode.offsetX(0);
    rectNode.offsetY(0);
    rectNode.width(layout.width);
    rectNode.height(layout.height);
    rectNode.scaleX(1);
    rectNode.scaleY(1);
  }

  const textNode = group.findOne('Text');
  if (textNode) {
    textNode.x(layout.textX);
    textNode.y(layout.textY);
    textNode.width(layout.glyphBox);
    textNode.height(layout.height);
    textNode.fontSize(layout.fontSize);
  }
}

function cornerPoint(corner: StickerCorner, width: number, height: number) {
  switch (corner) {
    case 'tl':
      return { x: 0, y: 0 };
    case 'tr':
      return { x: width, y: 0 };
    case 'bl':
      return { x: 0, y: height };
    case 'br':
      return { x: width, y: height };
  }
}

function rotatePoint(x: number, y: number, rad: number) {
  return {
    x: x * Math.cos(rad) - y * Math.sin(rad),
    y: x * Math.sin(rad) + y * Math.cos(rad),
  };
}

function resolveFixedCorner(activeAnchor?: string | null): StickerCorner {
  if (activeAnchor && OPPOSITE_CORNER[activeAnchor]) {
    return OPPOSITE_CORNER[activeAnchor];
  }
  return 'br';
}

/**
 * Bake a transformer scale on the sticker group into width/height.
 * Id/drag/transform all live on the group so the selection box stays glued to it.
 */
export function applyStickerGroupTransform(
  group: any,
  emoji: string,
  activeAnchor?: string | null,
) {
  const parent = group.getParent?.();
  if (!parent) return null;

  const bounds = group.findOne('.sticker-bounds');
  const baseW = Math.max(1, bounds?.width?.() || group.width() || 1);
  const baseH = Math.max(1, bounds?.height?.() || group.height() || 1);
  const scaleX = Math.abs(group.scaleX());
  const scaleY = Math.abs(group.scaleY());
  const size = Math.max(STICKER_MIN_SIZE, Math.max(baseW * scaleX, baseH * scaleY));
  const rotation = group.rotation() || 0;
  const fixedCorner = resolveFixedCorner(activeAnchor);

  // Corner in unscaled group space — AbsoluteTransform already includes scale.
  const fixedAbs = group.getAbsoluteTransform().point(cornerPoint(fixedCorner, baseW, baseH));

  group.scaleX(1);
  group.scaleY(1);
  group.offsetX(0);
  group.offsetY(0);
  syncStickerNodes(group, size, size, emoji);

  const rad = (rotation * Math.PI) / 180;
  const fixedCornerLocal = cornerPoint(fixedCorner, size, size);
  const anchored = rotatePoint(fixedCornerLocal.x, fixedCornerLocal.y, rad);
  const fixedParent = parent.getAbsoluteTransform().copy().invert().point(fixedAbs);

  group.position({
    x: fixedParent.x - anchored.x,
    y: fixedParent.y - anchored.y,
  });

  return { x: group.x(), y: group.y(), width: size, height: size, rotation };
}
