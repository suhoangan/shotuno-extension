import { useEditorStore } from './useEditorStore';
import { mergeToolSettings, type ToolSettings, type WatermarkMode } from './editorDefaults';

export const EDITOR_PREFS_KEY = 'shotunoEditorPrefs';
export const WATERMARK_IMAGE_KEY = 'shotunoWatermarkImage';

/** Per-tool style picker + watermark content (on/off is session-only — never persisted). */
export type EditorPrefs = {
  toolSettings?: Record<string, ToolSettings>;
  watermarkText?: string;
  watermarkMode?: WatermarkMode;
};

export function pickEditorPrefs(state: {
  toolSettings: Record<string, ToolSettings>;
  watermarkText: string;
  watermarkMode: WatermarkMode;
}): EditorPrefs {
  return {
    toolSettings: state.toolSettings,
    watermarkText: state.watermarkText,
    watermarkMode: state.watermarkMode,
  };
}

/** Apply saved picker defaults; keeps current activeTool and refreshes its UI swatches. */
export function applyEditorPrefs(prefs: EditorPrefs) {
  const toolSettings = mergeToolSettings(prefs.toolSettings);
  const { activeTool } = useEditorStore.getState();
  const settings = toolSettings[activeTool] || toolSettings.select;

  useEditorStore.setState({
    toolSettings,
    selectedColor: settings.color,
    strokeWidth: settings.strokeWidth,
    isSolid: settings.isSolid,
    isTwoWay: settings.isTwoWay,
    isLine: settings.isLine ?? false,
    blurType: settings.blurType || 'pixelate',
    counterStyle: settings.counterStyle || 'circle',
    // Never restore watermarkEnabled — each editor session starts with watermark off.
    ...(typeof prefs.watermarkText === 'string' ? { watermarkText: prefs.watermarkText } : {}),
    ...(prefs.watermarkMode === 'text' || prefs.watermarkMode === 'image'
      ? { watermarkMode: prefs.watermarkMode }
      : {}),
  });
}

function writePrefs(prefs: EditorPrefs) {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  chrome.storage.local.set({ [EDITOR_PREFS_KEY]: prefs });
}

function writeWatermarkImage(url: string | null) {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  if (url) chrome.storage.local.set({ [WATERMARK_IMAGE_KEY]: url });
  else chrome.storage.local.remove([WATERMARK_IMAGE_KEY]);
}

export function hydrateEditorPrefs(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      resolve();
      return;
    }
    chrome.storage.local.get([EDITOR_PREFS_KEY, WATERMARK_IMAGE_KEY], (result) => {
      const prefs = result[EDITOR_PREFS_KEY] as EditorPrefs | undefined;
      if (prefs && typeof prefs === 'object') applyEditorPrefs(prefs);
      const logo = result[WATERMARK_IMAGE_KEY];
      if (typeof logo === 'string' && logo) {
        useEditorStore.setState({ watermarkImageUrl: logo });
      }
      resolve();
    });
  });
}

export function bindEditorPrefsPersistence() {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastJson = JSON.stringify(pickEditorPrefs(useEditorStore.getState()));
  let lastLogo = useEditorStore.getState().watermarkImageUrl;

  const flush = () => {
    const state = useEditorStore.getState();
    const prefs = pickEditorPrefs(state);
    lastJson = JSON.stringify(prefs);
    writePrefs(prefs);
    if (state.watermarkImageUrl !== lastLogo) {
      lastLogo = state.watermarkImageUrl;
      writeWatermarkImage(state.watermarkImageUrl);
    }
  };

  const unsub = useEditorStore.subscribe((state) => {
    const nextJson = JSON.stringify(pickEditorPrefs(state));
    const logoChanged = state.watermarkImageUrl !== lastLogo;
    if (nextJson === lastJson && !logoChanged) return;
    lastJson = nextJson;
    if (timer) clearTimeout(timer);
    timer = setTimeout(flush, 150);
  });

  return () => {
    unsub();
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    flush();
  };
}
