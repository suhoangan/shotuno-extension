export type SmartMeasureBounds = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  centerX: number;
  centerY: number;
  hasVertical: boolean;
  hasHorizontal: boolean;
};

/** Minimum span in px before a smart measure is worth drawing */
const MIN_SPAN = 2;

export function canMeasureHeight(bounds: SmartMeasureBounds) {
  return bounds.hasVertical && bounds.bottom - bounds.top > MIN_SPAN;
}

export function canMeasureWidth(bounds: SmartMeasureBounds) {
  return bounds.hasHorizontal && bounds.right - bounds.left > MIN_SPAN;
}

/** Near top/bottom edges → height; near left/right edges → width. */
export function pickSmartMeasureAxis(
  pos: { x: number; y: number },
  bounds: SmartMeasureBounds,
): 'height' | 'width' | null {
  const heightOk = canMeasureHeight(bounds);
  const widthOk = canMeasureWidth(bounds);
  if (!heightOk && !widthOk) return null;
  if (heightOk && !widthOk) return 'height';
  if (widthOk && !heightOk) return 'width';

  const distToVerticalEdges = Math.min(
    Math.abs(pos.y - bounds.top),
    Math.abs(pos.y - bounds.bottom),
  );
  const distToHorizontalEdges = Math.min(
    Math.abs(pos.x - bounds.left),
    Math.abs(pos.x - bounds.right),
  );

  return distToVerticalEdges <= distToHorizontalEdges ? 'height' : 'width';
}

export function buildSmartMeasureShape(
  pos: { x: number; y: number },
  bounds: SmartMeasureBounds,
  color: string,
  strokeWidth: number,
) {
  const axis = pickSmartMeasureAxis(pos, bounds);
  if (!axis) return null;

  const id = `${Date.now()}-${axis}`;
  if (axis === 'height') {
    return {
      id,
      type: 'measure' as const,
      points: [pos.x, bounds.top, pos.x, bounds.bottom],
      color,
      strokeWidth,
    };
  }

  return {
    id,
    type: 'measure' as const,
    points: [bounds.left, pos.y, bounds.right, pos.y],
    color,
    strokeWidth,
  };
}
