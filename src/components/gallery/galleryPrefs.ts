export type GalleryViewMode = 'grid' | 'list';
export type GalleryDateFilter = 'all' | 'today' | 'week';

export type GalleryUiPrefs = {
  view: GalleryViewMode;
  filter: GalleryDateFilter;
  compactWidth: boolean;
};

export const GALLERY_UI_PREFS_KEY = 'shotunoGalleryUiPrefs';

export const DEFAULT_GALLERY_UI_PREFS: GalleryUiPrefs = {
  view: 'grid',
  filter: 'all',
  compactWidth: false,
};

export function loadGalleryUiPrefs(): Promise<GalleryUiPrefs> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      resolve({ ...DEFAULT_GALLERY_UI_PREFS });
      return;
    }
    chrome.storage.local.get([GALLERY_UI_PREFS_KEY], (result) => {
      const raw = result[GALLERY_UI_PREFS_KEY] as Partial<GalleryUiPrefs> | undefined;
      resolve({
        view: raw?.view === 'list' ? 'list' : 'grid',
        filter: raw?.filter === 'today' || raw?.filter === 'week' ? raw.filter : 'all',
        compactWidth: Boolean(raw?.compactWidth),
      });
    });
  });
}

export function saveGalleryUiPrefs(prefs: GalleryUiPrefs) {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  chrome.storage.local.set({ [GALLERY_UI_PREFS_KEY]: prefs });
}

export function filterGalleryByDate<T extends { timestamp: number }>(
  images: T[],
  filter: GalleryDateFilter,
): T[] {
  if (filter === 'all') return images;
  const now = Date.now();
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayMs = startOfToday.getTime();
  const weekMs = now - 7 * 24 * 60 * 60 * 1000;

  return images.filter((img) => {
    if (filter === 'today') return img.timestamp >= todayMs;
    return img.timestamp >= weekMs;
  });
}

export function formatGalleryDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
