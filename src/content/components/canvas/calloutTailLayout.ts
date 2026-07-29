import {
  TEXT_CALLOUT_REF_FONT_SIZE,
  calloutTailMetrics,
} from '../../../store/editorDefaults';

export interface CalloutTailLayout {
  visible: boolean;
  /** Single filled path for the bubble (+ optional triangle), so no seam at the join. */
  path: string;
  tipX: number;
  tipY: number;
}

type Side = 'top' | 'right' | 'bottom' | 'left';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function getDefaultCalloutTailTip(
  shapeWidth: number,
  shapeHeight: number,
  fontSize = TEXT_CALLOUT_REF_FONT_SIZE,
) {
  const { tailWidth, defaultTailYOffset } = calloutTailMetrics(fontSize);
  return {
    x: shapeWidth / 4 + tailWidth / 2 - 10 * (fontSize / TEXT_CALLOUT_REF_FONT_SIZE),
    y: shapeHeight + defaultTailYOffset,
  };
}

function isTipInsideBox(tipX: number, tipY: number, width: number, height: number) {
  return tipX > 0 && tipX < width && tipY > 0 && tipY < height;
}

function rayBoxExitPoint(
  originX: number,
  originY: number,
  tipX: number,
  tipY: number,
  width: number,
  height: number,
) {
  const dx = tipX - originX;
  const dy = tipY - originY;

  if (dx === 0 && dy === 0) {
    return { x: width / 2, y: height, side: 'bottom' as Side };
  }

  const hits: { t: number; x: number; y: number; side: Side }[] = [];

  if (dx !== 0) {
    for (const [edgeX, side] of [[0, 'left'], [width, 'right']] as const) {
      const t = (edgeX - originX) / dx;
      if (t > 0.001) {
        const y = originY + t * dy;
        if (y >= 0 && y <= height) hits.push({ t, x: edgeX, y, side });
      }
    }
  }

  if (dy !== 0) {
    for (const [edgeY, side] of [[0, 'top'], [height, 'bottom']] as const) {
      const t = (edgeY - originY) / dy;
      if (t > 0.001) {
        const x = originX + t * dx;
        if (x >= 0 && x <= width) hits.push({ t, x, y: edgeY, side });
      }
    }
  }

  hits.sort((a, b) => a.t - b.t);
  if (hits.length > 0) return hits[0];

  if (tipY >= height) return { x: clamp(tipX, 0, width), y: height, side: 'bottom' as Side };
  if (tipY <= 0) return { x: clamp(tipX, 0, width), y: 0, side: 'top' as Side };
  if (tipX <= 0) return { x: 0, y: clamp(tipY, 0, height), side: 'left' as Side };
  return { x: width, y: clamp(tipY, 0, height), side: 'right' as Side };
}

function roundedRectPath(w: number, h: number, r: number) {
  const cr = Math.min(r, w / 2, h / 2);
  return [
    `M ${cr} 0`,
    `L ${w - cr} 0`,
    `Q ${w} 0 ${w} ${cr}`,
    `L ${w} ${h - cr}`,
    `Q ${w} ${h} ${w - cr} ${h}`,
    `L ${cr} ${h}`,
    `Q 0 ${h} 0 ${h - cr}`,
    `L 0 ${cr}`,
    `Q 0 0 ${cr} 0`,
    'Z',
  ].join(' ');
}

/** Clockwise rounded rect with a triangular notch on one edge (one solid outline). */
function bubbleWithTailPath(
  w: number,
  h: number,
  r: number,
  side: Side,
  tipX: number,
  tipY: number,
  baseA: number,
  baseB: number,
) {
  const cr = Math.min(r, w / 2, h / 2);
  // On each edge, baseA is the point encountered first when walking clockwise.
  const parts = [`M ${cr} 0`];

  // Top edge: left → right
  if (side === 'top') {
    parts.push(`L ${baseA} 0`, `L ${tipX} ${tipY}`, `L ${baseB} 0`, `L ${w - cr} 0`);
  } else {
    parts.push(`L ${w - cr} 0`);
  }
  parts.push(`Q ${w} 0 ${w} ${cr}`);

  // Right edge: top → bottom
  if (side === 'right') {
    parts.push(`L ${w} ${baseA}`, `L ${tipX} ${tipY}`, `L ${w} ${baseB}`, `L ${w} ${h - cr}`);
  } else {
    parts.push(`L ${w} ${h - cr}`);
  }
  parts.push(`Q ${w} ${h} ${w - cr} ${h}`);

  // Bottom edge: right → left
  if (side === 'bottom') {
    parts.push(`L ${baseA} ${h}`, `L ${tipX} ${tipY}`, `L ${baseB} ${h}`, `L ${cr} ${h}`);
  } else {
    parts.push(`L ${cr} ${h}`);
  }
  parts.push(`Q 0 ${h} 0 ${h - cr}`);

  // Left edge: bottom → top
  if (side === 'left') {
    parts.push(`L 0 ${baseA}`, `L ${tipX} ${tipY}`, `L 0 ${baseB}`, `L 0 ${cr}`);
  } else {
    parts.push(`L 0 ${cr}`);
  }
  parts.push(`Q 0 0 ${cr} 0`, 'Z');

  return parts.join(' ');
}

export function computeCalloutTailLayout(
  shapeWidth: number,
  shapeHeight: number,
  tipX: number,
  tipY: number,
  fontSize = TEXT_CALLOUT_REF_FONT_SIZE,
): CalloutTailLayout {
  const { tailWidth, inset, cornerRadius } = calloutTailMetrics(fontSize);

  if (isTipInsideBox(tipX, tipY, shapeWidth, shapeHeight)) {
    return {
      visible: false,
      path: roundedRectPath(shapeWidth, shapeHeight, cornerRadius),
      tipX,
      tipY,
    };
  }

  const hit = rayBoxExitPoint(
    shapeWidth / 2,
    shapeHeight / 2,
    tipX,
    tipY,
    shapeWidth,
    shapeHeight,
  );
  const half = tailWidth / 2;
  const edgePad = Math.max(inset, cornerRadius);

  let baseA: number;
  let baseB: number;

  if (hit.side === 'top' || hit.side === 'bottom') {
    const center = clamp(hit.x, edgePad + half, shapeWidth - edgePad - half);
    // Clockwise: top L→R uses low then high; bottom R→L uses high then low
    if (hit.side === 'top') {
      baseA = center - half;
      baseB = center + half;
    } else {
      baseA = center + half;
      baseB = center - half;
    }
  } else {
    const center = clamp(hit.y, edgePad + half, shapeHeight - edgePad - half);
    // Clockwise: right T→B uses low then high; left B→T uses high then low
    if (hit.side === 'right') {
      baseA = center - half;
      baseB = center + half;
    } else {
      baseA = center + half;
      baseB = center - half;
    }
  }

  return {
    visible: true,
    path: bubbleWithTailPath(
      shapeWidth,
      shapeHeight,
      cornerRadius,
      hit.side,
      tipX,
      tipY,
      baseA,
      baseB,
    ),
    tipX,
    tipY,
  };
}

export function resolveCalloutTailTip(
  shapeWidth: number,
  shapeHeight: number,
  tailX: number | undefined,
  tailY: number | undefined,
  fontSize = TEXT_CALLOUT_REF_FONT_SIZE,
) {
  if (tailX !== undefined && tailY !== undefined) {
    return { x: tailX, y: tailY };
  }
  return getDefaultCalloutTailTip(shapeWidth, shapeHeight, fontSize);
}

/** Shottr-style contrast: light bubble backgrounds get dark text, dark backgrounds get white text. */
export function calloutTextFill(bgColor: string) {
  const hex = bgColor.replace('#', '');
  if (hex.length !== 6) return '#ffffff';

  const r = Number.parseInt(hex.slice(0, 2), 16);
  const g = Number.parseInt(hex.slice(2, 4), 16);
  const b = Number.parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#000000' : '#ffffff';
}
