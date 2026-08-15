export type ToolType = 'select' | 'pan' | 'arrow' | 'measure' | 'rect' | 'circle' | 'triangle' | 'text' | 'brush' | 'blur' | 'image' | 'crop' | 'counter' | 'magnifier' | 'highlight' | 'highlight-area' | 'ocr';

// Stickers are placed from the tray rather than by a toolbar tool, so shapes
// cover one more kind than the tools do
export type ShapeType = ToolType | 'sticker';

export interface BaseShape {
  id: string;
  type: ShapeType;
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  isSolid?: boolean;
  opacity?: number;
  isTwoWay?: boolean;
  /** Arrow drawn as a plain line (no pointer heads). */
  isLine?: boolean;
  blurType?: 'pixelate' | 'blur' | 'solid';
}

export interface ArrowShape extends BaseShape {
  type: 'arrow';
  points: number[];
  color: string;
  strokeWidth: number;
}

export interface MeasureShape extends BaseShape {
  type: 'measure';
  points: number[];
  color: string;
  strokeWidth: number;
}

export interface RectShape extends BaseShape {
  type: 'rect' | 'circle' | 'triangle' | 'blur';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  strokeWidth: number;
}

export interface BrushShape extends BaseShape {
  type: 'brush';
  points: number[];
  color: string;
  strokeWidth: number;
}

export interface TextShape extends BaseShape {
  type: 'text';
  x: number;
  y: number;
  text: string;
  color: string;
  fontSize: number;
  strokeWidth?: number;
  width?: number;
  height?: number;
  tailX?: number;
  tailY?: number;
}

// An emoji placed on the canvas: sized by its box like an image, no callout styling
export interface StickerShape extends BaseShape {
  type: 'sticker';
  x: number;
  y: number;
  width: number;
  height: number;
  emoji: string;
}

export interface ImageShape extends BaseShape {
  type: 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  src: string;
  /** Border color — used when `isSolid` is false (border on). */
  color?: string;
  /** Border width — used when `isSolid` is false (border on). */
  strokeWidth?: number;
  image?: HTMLImageElement; // Loaded image reference
}

export interface CounterShape extends BaseShape {
  type: 'counter';
  x: number;
  y: number;
  count: number;
  color: string;
  strokeWidth: number;
  counterStyle?: 'circle' | 'square' | 'waterpoint';
}

export interface MagnifierShape extends BaseShape {
  type: 'magnifier';
  /** Top-left of the bounding square (lens center = x + radius, y + radius). */
  x: number;
  y: number;
  radius: number;
  zoomLevel: number;
  color: string;
  strokeWidth: number;
}

export interface HighlightShape extends BaseShape {
  type: 'highlight';
  points: number[];
  color: string;
  strokeWidth: number;
}

export interface HighlightAreaShape extends BaseShape {
  type: 'highlight-area';
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export type Shape = ArrowShape | HighlightShape | HighlightAreaShape | MeasureShape | RectShape | BrushShape | TextShape | StickerShape | ImageShape | CounterShape | MagnifierShape;
