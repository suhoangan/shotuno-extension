import { create } from 'zustand';
import type { Shape } from './editorTypes';
import { defaultToolSettings, DEFAULT_BORDER_PADDING_PRESET, DEFAULT_BORDER_PADDING_SIZE, DEFAULT_WATERMARK_ENABLED, DEFAULT_WATERMARK_TEXT, snapBorderPaddingSize, mergeToolSettings, type WatermarkMode } from './editorDefaults';
import { withToolStylePersist } from './editorToolStyle';
import type { EditorState } from './editorStoreTypes';
export * from './editorTypes';
export * from './editorStoreTypes';

export const useEditorStore = create<EditorState>((set) => ({
  activeTool: 'select',
  // Clone so per-tool picker edits never mutate the shared defaults object
  toolSettings: mergeToolSettings(),
  setActiveTool: (tool) => set((state) => {
    const settings = state.toolSettings[tool] || defaultToolSettings[tool] || defaultToolSettings['select'];
    return { 
      activeTool: tool,
      selectedColor: settings.color,
      strokeWidth: settings.strokeWidth,
      isSolid: settings.isSolid,
      isTwoWay: settings.isTwoWay,
      isLine: settings.isLine ?? false,
      opacity: settings.opacity,
      blurType: settings.blurType || 'pixelate',
      counterStyle: settings.counterStyle || 'circle'
    };
  }),
  
  selectedColor: '#ef4444', // red-500
  setSelectedColor: (color, opts) => set((state) =>
    withToolStylePersist(state, { selectedColor: color }, { color }, opts?.persistToTool !== false),
  ),
  strokeWidth: 4,
  setStrokeWidth: (width, opts) => set((state) =>
    withToolStylePersist(state, { strokeWidth: width }, { strokeWidth: width }, opts?.persistToTool !== false),
  ),
  selectedShapeIds: [],
  setSelectedShapeIds: (ids) => set((state) => {
    if (ids.length > 0) return { selectedShapeIds: ids };
    // Restore the active tool's own style so selecting another shape can't leak color
    const settings = state.toolSettings[state.activeTool]
      || defaultToolSettings[state.activeTool]
      || defaultToolSettings.select;
    return {
      selectedShapeIds: ids,
      selectedColor: settings.color,
      strokeWidth: settings.strokeWidth,
      isSolid: settings.isSolid,
      isTwoWay: settings.isTwoWay,
      isLine: settings.isLine ?? false,
      opacity: settings.opacity,
      blurType: settings.blurType || 'pixelate',
      counterStyle: settings.counterStyle || 'circle',
    };
  }),
  isSolid: false,
  setIsSolid: (solid, opts) => set((state) =>
    withToolStylePersist(state, { isSolid: solid }, { isSolid: solid }, opts?.persistToTool !== false),
  ),
  isTwoWay: false,
  setIsTwoWay: (twoWay, opts) => set((state) =>
    withToolStylePersist(state, { isTwoWay: twoWay }, { isTwoWay: twoWay }, opts?.persistToTool !== false),
  ),
  isLine: false,
  setIsLine: (line, opts) => set((state) =>
    withToolStylePersist(state, { isLine: line }, { isLine: line }, opts?.persistToTool !== false),
  ),
  opacity: undefined,
  setOpacity: (opacity, opts) => set((state) =>
    withToolStylePersist(state, { opacity }, { opacity }, opts?.persistToTool !== false),
  ),
  blurType: 'pixelate',
  setBlurType: (type, opts) => set((state) =>
    withToolStylePersist(state, { blurType: type }, { blurType: type }, opts?.persistToTool !== false),
  ),
  counterStyle: 'circle',
  setCounterStyle: (style, opts) => set((state) =>
    withToolStylePersist(state, { counterStyle: style }, { counterStyle: style }, opts?.persistToTool !== false),
  ),
  isDragging: false,
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  
  shapes: [],
  setShapes: (shapes) => set({ shapes }),
  
  addShape: (shape) => set((state) => {
    return { shapes: [...state.shapes, shape] };
  }),
  
  updateShape: (id, newProps) => set((state) => {
    const newShapes = state.shapes.map(s => s.id === id ? { ...s, ...newProps } as Shape : s);
    return { shapes: newShapes };
  }),
  
  history: [{ shapes: [], cropRect: null }],
  historyStep: 0,
  
  saveHistory: () => set((state) => {
    const MAX_HISTORY = 50;
    const newHistory = state.history.slice(0, state.historyStep + 1);
    newHistory.push({ shapes: state.shapes, cropRect: state.cropRect });
    while (newHistory.length > MAX_HISTORY) {
      newHistory.shift();
    }
    return { history: newHistory, historyStep: newHistory.length - 1 };
  }),
  
  undo: () => set((state) => {
    if (state.historyStep === 0) return state;
    const newStep = state.historyStep - 1;
    const stepState = state.history[newStep];
    return { historyStep: newStep, shapes: stepState.shapes, cropRect: stepState.cropRect };
  }),
  
  redo: () => set((state) => {
    if (state.historyStep === state.history.length - 1) return state;
    const newStep = state.historyStep + 1;
    const stepState = state.history[newStep];
    return { historyStep: newStep, shapes: stepState.shapes, cropRect: stepState.cropRect };
  }),

  reset: () => set({
    shapes: [],
    history: [{ shapes: [], cropRect: null }],
    historyStep: 0,
    selectedShapeIds: [],
    cropRect: null,
    // Watermark content (text/image) is remembered; on/off starts off each capture.
    watermarkEnabled: DEFAULT_WATERMARK_ENABLED,
  }),

  galleryImages: [],
  setGalleryImages: (images) => set({ galleryImages: images }),
  addGalleryImage: (image) => set((state) => ({ galleryImages: [image, ...state.galleryImages] })),

  cropRect: null,
  setCropRect: (rect) => set({ cropRect: rect }),
  
  ocrRect: null,
  setOcrRect: (rect) => set({ ocrRect: rect }),

  smartMeasureBounds: null,
  setSmartMeasureBounds: (bounds) => set({ smartMeasureBounds: bounds }),

  borderEnabled: false,
  setBorderEnabled: (enabled) => set({ borderEnabled: enabled }),
  borderStyle: 'macos',
  setBorderStyle: (style) => set({ borderStyle: style }),
  borderPadding: true,
  setBorderPadding: (padding) => set((state) => ({
    borderPadding: padding,
    // Padding fill is drawn by the border overlay — turn border on with padding.
    borderEnabled: padding ? true : state.borderEnabled,
  })),
  borderPaddingPreset: DEFAULT_BORDER_PADDING_PRESET,
  setBorderPaddingPreset: (preset) => set({
    borderPaddingPreset: preset,
    borderPadding: true,
    borderEnabled: true,
  }),
  borderPaddingSize: DEFAULT_BORDER_PADDING_SIZE,
  setBorderPaddingSize: (size) => set({
    borderPaddingSize: snapBorderPaddingSize(size),
    borderPadding: true,
    borderEnabled: true,
  }),
  includeUrl: true,
  setIncludeUrl: (include) => set({ includeUrl: include }),
  includeDate: false,
  setIncludeDate: (include) => set({ includeDate: include }),
  urlPosition: 'top',
  setUrlPosition: (pos) => set({ urlPosition: pos }),

  watermarkEnabled: false,
  setWatermarkEnabled: (enabled) => set({ watermarkEnabled: enabled }),
  watermarkText: DEFAULT_WATERMARK_TEXT,
  setWatermarkText: (text) => set({ watermarkText: text }),
  watermarkMode: 'text' as WatermarkMode,
  setWatermarkMode: (mode) => set({ watermarkMode: mode }),
  watermarkImageUrl: null as string | null,
  setWatermarkImageUrl: (url) => set({ watermarkImageUrl: url }),

  proLicenseStatus: 'free',
  setProLicenseStatus: (status) => set({ proLicenseStatus: status }),
  showUpgradeModal: false,
  setShowUpgradeModal: (show) => set({ showUpgradeModal: show }),
}));

// Initialize Pro license status from storage.local if available
if (typeof chrome !== 'undefined' && chrome.storage?.local) {
  chrome.storage.local.get(['pro_license_status'], (res) => {
    if (res?.pro_license_status === 'pro' || res?.pro_license_status === 'free') {
      useEditorStore.getState().setProLicenseStatus(res.pro_license_status);
    }
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === 'local' && changes.pro_license_status) {
      const nextStatus = changes.pro_license_status.newValue;
      if (nextStatus === 'pro' || nextStatus === 'free') {
        useEditorStore.getState().setProLicenseStatus(nextStatus);
      }
    }
  });
}

