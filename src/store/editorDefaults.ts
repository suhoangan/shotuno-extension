export type ToolSettings = {
  color: string;
  strokeWidth: number;
  opacity?: number;
  isSolid: boolean;
  isTwoWay: boolean;
  /** Arrow tool: plain line with no pointer heads. */
  isLine?: boolean;
  blurType: 'pixelate' | 'blur' | 'solid';
  counterStyle?: 'circle' | 'square' | 'waterpoint';
};

export const defaultToolSettings: Record<string, ToolSettings> = {
  select: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, blurType: 'pixelate' },
  pan: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, blurType: 'pixelate' },
  arrow: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, isLine: false, blurType: 'pixelate' },
  measure: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, blurType: 'pixelate' },
  rect: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, blurType: 'pixelate' },
  circle: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, blurType: 'pixelate' },
  triangle: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, blurType: 'pixelate' },
  text: { color: '#ef4444', strokeWidth: 4, isSolid: true, isTwoWay: false, blurType: 'pixelate' },
  brush: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, blurType: 'pixelate' },
  highlight: { color: '#facc15', strokeWidth: 8, isSolid: false, isTwoWay: false, blurType: 'pixelate' },
  'highlight-area': { color: '#facc15', strokeWidth: 8, isSolid: false, opacity: 0.2, isTwoWay: false, blurType: 'pixelate' },
  blur: { color: '#ef4444', strokeWidth: 8, isSolid: false, isTwoWay: false, blurType: 'pixelate' as const },
  // isSolid true = border off (same convention as magnifier)
  image: { color: '#ef4444', strokeWidth: 4, isSolid: true, isTwoWay: false, blurType: 'pixelate' as const },
  crop: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, blurType: 'pixelate' as const },
  counter: {
    color: '#ef4444',
    strokeWidth: 12,
    isSolid: false,
    isTwoWay: false,
    blurType: 'pixelate' as const,
    counterStyle: 'circle' as const,
  },
  callout: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, blurType: 'pixelate' as const },
  magnifier: { color: '#ef4444', strokeWidth: 4, isSolid: true, isTwoWay: false, blurType: 'pixelate' as const },
  ocr: { color: '#ef4444', strokeWidth: 4, isSolid: false, isTwoWay: false, blurType: 'pixelate' as const },
};

const BLUR_TYPES = new Set(['pixelate', 'blur', 'solid']);
const COUNTER_STYLES = new Set(['circle', 'square', 'waterpoint']);

function sanitizeToolSettings(raw: Partial<ToolSettings> | undefined, fallback: ToolSettings): ToolSettings {
  if (!raw || typeof raw !== 'object') return { ...fallback };
  const blurType = BLUR_TYPES.has(raw.blurType as string)
    ? (raw.blurType as ToolSettings['blurType'])
    : fallback.blurType;
  const counterStyle = COUNTER_STYLES.has(raw.counterStyle as string)
    ? (raw.counterStyle as ToolSettings['counterStyle'])
    : fallback.counterStyle;
  return {
    color: typeof raw.color === 'string' ? raw.color : fallback.color,
    strokeWidth: snapStrokeWidth(
      typeof raw.strokeWidth === 'number' ? raw.strokeWidth : fallback.strokeWidth,
    ),
    opacity: typeof raw.opacity === 'number' ? raw.opacity : fallback.opacity,
    isSolid: typeof raw.isSolid === 'boolean' ? raw.isSolid : fallback.isSolid,
    isTwoWay: typeof raw.isTwoWay === 'boolean' ? raw.isTwoWay : fallback.isTwoWay,
    isLine: typeof raw.isLine === 'boolean' ? raw.isLine : (fallback.isLine ?? false),
    blurType,
    ...(counterStyle ? { counterStyle } : {}),
  };
}

/** Border style for a new dropped/pasted image (from the `image` tool prefs). */
export function imageShapeStyleFromTool(
  toolSettings?: Record<string, ToolSettings>,
): Pick<ToolSettings, 'color' | 'strokeWidth' | 'isSolid'> {
  const s = toolSettings?.image || defaultToolSettings.image;
  return {
    color: s.color,
    strokeWidth: s.strokeWidth,
    isSolid: s.isSolid,
  };
}

/** Fresh per-tool picker map (cloned defaults, optionally merged with saved prefs). */
export function mergeToolSettings(saved?: Record<string, Partial<ToolSettings>>) {
  const merged: Record<string, ToolSettings> = {};
  for (const id of Object.keys(defaultToolSettings)) {
    merged[id] = sanitizeToolSettings(saved?.[id], defaultToolSettings[id]);
  }
  return merged;
}

// Text callout box — shared by TextShape, InlineTextEditor, and text creation
export const TEXT_PADDING = 12;
export const TEXT_MAX_WIDTH = 480;
export const TEXT_LINE_HEIGHT = 1.2;
/** Empty / brand-new callouts are sized to fit this many characters. */
export const TEXT_MIN_CHARS = 2;

export function textFontSizeFromStrokeWidth(strokeWidth: number) {
  // Size slider → font px (Size 4 ≈ 20px on a ~1280px capture)
  return Math.round(strokeWidth * 5);
}

/** Watermark defaults — shared by WatermarkMenu + CanvasStage */
export const DEFAULT_WATERMARK_ENABLED = false;
export const DEFAULT_WATERMARK_TEXT = '© Shotuno';
export const WATERMARK_IMAGE_MAX_WIDTH = 120;
export const WATERMARK_OPACITY = 0.7;
export const WATERMARK_PAD = 16;
export type WatermarkMode = 'text' | 'image';


/** Min box width: padding + room for TEXT_MIN_CHARS wide glyphs at this font size. */
export function textMinWidth(fontSize: number) {
  if (typeof document === 'undefined') {
    return Math.ceil(fontSize * 0.7 * TEXT_MIN_CHARS) + TEXT_PADDING * 2;
  }
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return Math.ceil(fontSize * 0.7 * TEXT_MIN_CHARS) + TEXT_PADDING * 2;
  ctx.font = `600 ${fontSize}px sans-serif`;
  return Math.ceil(ctx.measureText('W'.repeat(TEXT_MIN_CHARS)).width + TEXT_PADDING * 2);
}

export function textDefaultWidth(fontSize: number) {
  return textMinWidth(fontSize);
}

/** One line of text (at line-height) + top/bottom padding. Also the min box height. */
export function textMinHeight(fontSize: number) {
  return Math.ceil(fontSize * TEXT_LINE_HEIGHT) + TEXT_PADDING * 2;
}

/** Initial box height — always one line + padding. */
export function textDefaultHeight(fontSize: number) {
  return textMinHeight(fontSize);
}

/** Height for N wrapped/newline lines + padding. */
export function textHeightForLines(fontSize: number, lineCount: number) {
  const lines = Math.max(1, lineCount);
  return Math.ceil(fontSize * TEXT_LINE_HEIGHT * lines) + TEXT_PADDING * 2;
}

export const TEXT_CALLOUT_TAIL_WIDTH = 16;
export const TEXT_CALLOUT_TAIL_INSET = 8;
export const TEXT_CALLOUT_DEFAULT_TAIL_Y_OFFSET = 25;
export const TEXT_CALLOUT_CORNER_RADIUS = 8;
/** Callout constants above are tuned for this font size; scale with fontSize. */
export const TEXT_CALLOUT_REF_FONT_SIZE = 20;

/** Tail / corner metrics that grow with the text box font. */
export function calloutTailMetrics(fontSize: number) {
  const s = Math.max(0.5, (fontSize || TEXT_CALLOUT_REF_FONT_SIZE) / TEXT_CALLOUT_REF_FONT_SIZE);
  return {
    tailWidth: Math.max(8, Math.round(TEXT_CALLOUT_TAIL_WIDTH * s)),
    inset: Math.max(4, Math.round(TEXT_CALLOUT_TAIL_INSET * s)),
    defaultTailYOffset: Math.max(12, Math.round(TEXT_CALLOUT_DEFAULT_TAIL_Y_OFFSET * s)),
    cornerRadius: Math.max(4, Math.round(TEXT_CALLOUT_CORNER_RADIUS * s)),
  };
}

// Box a new sticker is created with, shared by the tray click and the drag-drop paths
export const STICKER_SIZE = 110;

// Stroke-width slider: stepped so each notch is easy to hit (4, 8, 12, …, 40)
export const STROKE_WIDTH_MIN = 4;
export const STROKE_WIDTH_MAX = 40;
export const STROKE_WIDTH_STEP = 4;

export function snapStrokeWidth(value: number) {
  const snapped = Math.round(value / STROKE_WIDTH_STEP) * STROKE_WIDTH_STEP;
  return Math.min(STROKE_WIDTH_MAX, Math.max(STROKE_WIDTH_MIN, snapped));
}

export type BorderPaddingPresetId = 'sunset' | 'ocean' | 'mint' | 'white' | 'slate' | 'charcoal';

export const BORDER_PADDING_SIZE_MIN = 8;
export const BORDER_PADDING_SIZE_MAX = 80;
export const BORDER_PADDING_SIZE_STEP = 4;
export const DEFAULT_BORDER_PADDING_SIZE = 30;
export const BORDER_HEADER_HEIGHT = 48;
export const BORDER_FOOTER_HEIGHT = 40;
/** Three 40px Min/Max/Close hit targets. */
export const BORDER_WINDOWS_CONTROLS_WIDTH = 120;
/** Inset from the frame’s right edge so controls clear the rounded corner. */
export const BORDER_WINDOWS_CONTROLS_RIGHT_PAD = 8;
/** Gap between header content (URL/date) and the window-control cluster. */
export const BORDER_WINDOWS_CONTROLS_GAP = 12;
export const BORDER_MACOS_CONTROLS_WIDTH = 72;
export const DEFAULT_BORDER_PADDING_PRESET: BorderPaddingPresetId = 'sunset';

export const BORDER_PADDING_PRESETS: {
  id: BorderPaddingPresetId;
  type: 'gradient' | 'solid';
  colors: string[];
  swatch: string;
}[] = [
  { id: 'sunset', type: 'gradient', colors: ['#f9a8d4', '#c084fc', '#818cf8'], swatch: 'linear-gradient(135deg, #f9a8d4, #818cf8)' },
  { id: 'ocean', type: 'gradient', colors: ['#67e8f9', '#60a5fa', '#6366f1'], swatch: 'linear-gradient(135deg, #67e8f9, #6366f1)' },
  { id: 'mint', type: 'gradient', colors: ['#6ee7b7', '#34d399', '#10b981'], swatch: 'linear-gradient(135deg, #6ee7b7, #10b981)' },
  { id: 'white', type: 'solid', colors: ['#ffffff'], swatch: '#ffffff' },
  { id: 'slate', type: 'solid', colors: ['#e2e8f0'], swatch: '#e2e8f0' },
  { id: 'charcoal', type: 'solid', colors: ['#1e293b'], swatch: '#1e293b' },
];

export function snapBorderPaddingSize(value: number) {
  const snapped = Math.round(value / BORDER_PADDING_SIZE_STEP) * BORDER_PADDING_SIZE_STEP;
  return Math.min(BORDER_PADDING_SIZE_MAX, Math.max(BORDER_PADDING_SIZE_MIN, snapped));
}
