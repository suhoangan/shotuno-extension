/**
 * Canonical extension feature ids — keep in sync with:
 * - shotuno-api/src/subscriptions/domain/pro-features.ts
 * - suhoangan/shotuno-web src/lib/pro-features.ts
 *
 * true = enabled / shown in extension UI; false = hidden / disabled.
 */
export const PRO_FEATURE_IDS = [
  'arrow',
  'shapes',
  'stickers',
  'text',
  'brush',
  'highlight',
  'counter',
  'blur',
  'magnifier',
  'measure',
  'crop',
  'resize',
  'window_border',
  'ocr',
  'smart_blur',
  'watermark',
  'send_to_ai',
  'send_to_saas',
  'export_copy',
  'export_download',
  'capture_full_page',
  'pins',
  'gallery',
] as const;

export type ProFeatureId = (typeof PRO_FEATURE_IDS)[number];

export type ProFeaturesMap = Record<ProFeatureId, boolean>;

export type ProFeatureCatalogItem = {
  id: ProFeatureId;
  label: string;
  group: string;
};

export type ProFeaturesAdminPayload = {
  features: ProFeaturesMap;
  catalog: ProFeatureCatalogItem[];
};

export const PRO_FEATURE_LABELS: Record<ProFeatureId, string> = {
  arrow: 'Arrow / Line',
  shapes: 'Shapes (rect / circle / triangle)',
  stickers: 'Stickers',
  text: 'Text / Callout',
  brush: 'Brush',
  highlight: 'Highlight',
  counter: 'Counter marker',
  blur: 'Manual blur',
  magnifier: 'Magnifier',
  measure: 'Measure / Distance',
  crop: 'Crop',
  resize: 'Resize image',
  window_border: 'Window border & padding',
  ocr: 'OCR text extract',
  smart_blur: 'Smart blur',
  watermark: 'Watermark',
  send_to_ai: 'Smart Parse / Send to AI',
  send_to_saas: 'Drag images onto web pages',
  export_copy: 'Copy to clipboard',
  export_download: 'Download / save file',
  capture_full_page: 'Full page capture',
  pins: 'Pins library',
  gallery: 'Downloads gallery',
};

export const PRO_FEATURE_GROUPS: Record<ProFeatureId, string> = {
  arrow: 'Annotation',
  shapes: 'Annotation',
  stickers: 'Annotation',
  text: 'Annotation',
  brush: 'Annotation',
  highlight: 'Annotation',
  counter: 'Annotation',
  blur: 'Annotation',
  magnifier: 'Annotation',
  measure: 'Annotation',
  crop: 'Edit',
  resize: 'Edit',
  window_border: 'Export polish',
  ocr: 'Tools',
  smart_blur: 'Tools',
  watermark: 'Export polish',
  send_to_ai: 'Tools',
  send_to_saas: 'Library',
  export_copy: 'Export',
  export_download: 'Export',
  capture_full_page: 'Capture',
  pins: 'Library',
  gallery: 'Library',
};

/** true = enabled in extension UI. Defaults: all on. */
export function defaultProFeatures(): ProFeaturesMap {
  const next = {} as ProFeaturesMap;
  for (const id of PRO_FEATURE_IDS) {
    next[id] = true;
  }
  return next;
}

export function normalizeProFeatures(raw: unknown): ProFeaturesMap {
  const defaults = defaultProFeatures();
  if (!raw || typeof raw !== 'object') return defaults;
  const input = raw as Record<string, unknown>;
  const next = { ...defaults };
  for (const id of PRO_FEATURE_IDS) {
    if (typeof input[id] === 'boolean') next[id] = input[id];
  }
  return next;
}

/** true when the feature is enabled in the UI. Unknown ids stay enabled. */
export function isProFeatureEnabled(
  map: ProFeaturesMap,
  featureId: string,
): boolean {
  if ((PRO_FEATURE_IDS as readonly string[]).includes(featureId)) {
    return map[featureId as ProFeatureId];
  }
  return true;
}

export function isProFeatureId(value: string): value is ProFeatureId {
  return (PRO_FEATURE_IDS as readonly string[]).includes(value);
}

/**
 * Map tool / action → catalog feature id for UI enable/disable.
 * null = always available (select / pan / image).
 */
export function toolFeatureId(tool: string): ProFeatureId | null {
  switch (tool) {
    case 'arrow':
      return 'arrow';
    case 'rect':
    case 'circle':
    case 'triangle':
    case 'shapes':
      return 'shapes';
    case 'stickers':
    case 'sticker':
      return 'stickers';
    case 'text':
      return 'text';
    case 'brush':
      return 'brush';
    case 'highlight':
      return 'highlight';
    case 'counter':
      return 'counter';
    case 'blur':
      return 'blur';
    case 'magnifier':
      return 'magnifier';
    case 'measure':
      return 'measure';
    case 'crop':
      return 'crop';
    case 'ocr':
      return 'ocr';
    case 'smart_blur':
      return 'smart_blur';
    case 'send_to_ai':
      return 'send_to_ai';
    case 'watermark':
      return 'watermark';
    case 'window_border':
      return 'window_border';
    case 'resize':
      return 'resize';
    case 'export_copy':
      return 'export_copy';
    case 'export_download':
      return 'export_download';
    default:
      return null;
  }
}

/** Tools that consume Pro credits / subscription gate (subset of catalog). */
export function toolProFeatureId(
  tool: string,
): ProFeatureId | null {
  switch (tool) {
    case 'ocr':
      return 'ocr';
    case 'smart_blur':
      return 'smart_blur';
    case 'send_to_ai':
      return 'send_to_ai';
    case 'watermark':
      return 'watermark';
    case 'window_border':
      return 'window_border';
    case 'resize':
      return 'resize';
    case 'stickers':
      return 'stickers';
    default:
      return null;
  }
}
