import { storage } from './chromeStorage';

export type ExtensionIconAction = 'popup' | 'visible' | 'area' | 'full' | 'grid' | 'pin_area';
export type PostCaptureAction = 'open_editor' | 'copy_clipboard';
export type DownloadImageFormat = 'png' | 'jpg' | 'webp';

export interface CaptureSettings {
  iconAction: ExtensionIconAction;
  postCaptureAction: PostCaptureAction;
  autoPinEnabled: boolean;
  autoPinMaxLimit: number;
  downloadFormat: DownloadImageFormat;
}

export const CAPTURE_SETTINGS_KEY = 'shotuno_capture_settings';

export const DEFAULT_CAPTURE_SETTINGS: CaptureSettings = {
  iconAction: 'popup',
  postCaptureAction: 'open_editor',
  autoPinEnabled: false,
  autoPinMaxLimit: 3,
  downloadFormat: 'png',
};

function normalizeSettings(raw?: Partial<CaptureSettings>): CaptureSettings {
  if (!raw) return { ...DEFAULT_CAPTURE_SETTINGS };
  const format = raw.downloadFormat;
  const validFormat: DownloadImageFormat =
    format === 'jpg' || format === 'webp' ? format : 'png';

  return {
    iconAction: raw.iconAction ?? DEFAULT_CAPTURE_SETTINGS.iconAction,
    postCaptureAction: raw.postCaptureAction ?? DEFAULT_CAPTURE_SETTINGS.postCaptureAction,
    autoPinEnabled: raw.autoPinEnabled ?? DEFAULT_CAPTURE_SETTINGS.autoPinEnabled,
    autoPinMaxLimit: typeof raw.autoPinMaxLimit === 'number' && raw.autoPinMaxLimit > 0
      ? Math.min(raw.autoPinMaxLimit, 3)
      : DEFAULT_CAPTURE_SETTINGS.autoPinMaxLimit,
    downloadFormat: validFormat,
  };
}

export async function getCaptureSettings(): Promise<CaptureSettings> {
  const data = await storage.local.get([CAPTURE_SETTINGS_KEY]);
  return normalizeSettings(data[CAPTURE_SETTINGS_KEY] as Partial<CaptureSettings> | undefined);
}

export async function saveCaptureSettings(patch: Partial<CaptureSettings>): Promise<CaptureSettings> {
  const current = await getCaptureSettings();
  const next = normalizeSettings({ ...current, ...patch });
  await storage.local.set({ [CAPTURE_SETTINGS_KEY]: next });
  return next;
}

export function onCaptureSettingsChange(
  callback: (settings: CaptureSettings) => void,
): () => void {
  const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
    if (areaName !== 'local' || !changes[CAPTURE_SETTINGS_KEY]) return;
    callback(normalizeSettings(changes[CAPTURE_SETTINGS_KEY].newValue as Partial<CaptureSettings> | undefined));
  };

  storage.onChanged.addListener(listener);
  return () => {
    storage.onChanged.removeListener(listener);
  };
}
