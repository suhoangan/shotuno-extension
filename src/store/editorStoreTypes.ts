import type { Shape, ToolType } from './editorTypes';
import type { BorderPaddingPresetId, ToolSettings, WatermarkMode } from './editorDefaults';

export interface EditorState {
  activeTool: ToolType;
  setActiveTool: (tool: ToolType) => void;
  
  shapes: Shape[];
  setShapes: (shapes: Shape[]) => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, newProps: Partial<Shape>) => void;
  
  // UI State
  selectedColor: string;
  setSelectedColor: (color: string, opts?: { persistToTool?: boolean }) => void;
  strokeWidth: number;
  setStrokeWidth: (width: number, opts?: { persistToTool?: boolean }) => void;
  selectedShapeIds: string[];
  setSelectedShapeIds: (ids: string[]) => void;
  isSolid: boolean;
  setIsSolid: (solid: boolean, opts?: { persistToTool?: boolean }) => void;
  isTwoWay: boolean;
  setIsTwoWay: (twoWay: boolean, opts?: { persistToTool?: boolean }) => void;
  isLine: boolean;
  setIsLine: (line: boolean, opts?: { persistToTool?: boolean }) => void;
  opacity?: number;
  setOpacity: (opacity: number, opts?: { persistToTool?: boolean }) => void;
  blurType: 'pixelate' | 'blur' | 'solid';
  setBlurType: (type: 'pixelate' | 'blur' | 'solid', opts?: { persistToTool?: boolean }) => void;
  counterStyle: 'circle' | 'square' | 'waterpoint';
  setCounterStyle: (style: 'circle' | 'square' | 'waterpoint', opts?: { persistToTool?: boolean }) => void;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  
  // History for Undo/Redo
  history: { shapes: Shape[], cropRect: { x: number; y: number; width: number; height: number } | null }[];
  historyStep: number;
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  reset: () => void;
  
  toolSettings: Record<string, ToolSettings>;

  // Gallery
  galleryImages: { id: string; url: string; timestamp: number }[];
  setGalleryImages: (images: { id: string; url: string; timestamp: number }[]) => void;
  addGalleryImage: (image: { id: string; url: string; timestamp: number }) => void;

  // Crop
  cropRect: { x: number; y: number; width: number; height: number } | null;
  setCropRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;

  // OCR
  ocrRect: { x: number; y: number; width: number; height: number } | null;
  setOcrRect: (rect: { x: number; y: number; width: number; height: number } | null) => void;

  // Smart Measure
  smartMeasureBounds: { top: number, bottom: number, left: number, right: number, centerX: number, centerY: number, hasVertical: boolean, hasHorizontal: boolean } | null;
  setSmartMeasureBounds: (bounds: { top: number, bottom: number, left: number, right: number, centerX: number, centerY: number, hasVertical: boolean, hasHorizontal: boolean } | null) => void;

  // Border & Watermark Config
  borderEnabled: boolean;
  setBorderEnabled: (enabled: boolean) => void;
  borderStyle: 'macos' | 'windows' | 'none';
  setBorderStyle: (style: 'macos' | 'windows' | 'none') => void;
  borderPadding: boolean;
  setBorderPadding: (padding: boolean) => void;
  borderPaddingPreset: BorderPaddingPresetId;
  setBorderPaddingPreset: (preset: BorderPaddingPresetId) => void;
  borderPaddingSize: number;
  setBorderPaddingSize: (size: number) => void;
  includeUrl: boolean;
  setIncludeUrl: (include: boolean) => void;
  includeDate: boolean;
  setIncludeDate: (include: boolean) => void;
  urlPosition: 'top' | 'bottom';
  setUrlPosition: (pos: 'top' | 'bottom') => void;

  watermarkEnabled: boolean;
  setWatermarkEnabled: (enabled: boolean) => void;
  watermarkText: string;
  setWatermarkText: (text: string) => void;
  watermarkMode: WatermarkMode;
  setWatermarkMode: (mode: WatermarkMode) => void;
  watermarkImageUrl: string | null;
  setWatermarkImageUrl: (url: string | null) => void;

  // Pro License & Paywall Gating
  proLicenseStatus: 'free' | 'pro';
  setProLicenseStatus: (status: 'free' | 'pro') => void;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (show: boolean) => void;
}
