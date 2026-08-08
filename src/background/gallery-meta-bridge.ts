import { storage } from '../lib/chromeStorage';
const GALLERY_KEY = 'canvas_gallery_images';
const PINS_KEY = 'shotuno_pins';
const MAX_ITEMS = 20;

export type GalleryMetaItem = {
  id: string;
  filename?: string;
  timestamp: number;
  thumbnailUrl: string;
  source: 'gallery' | 'pin';
};

type StoredImage = {
  id: string;
  url?: string;
  timestamp?: number;
  filename?: string;
};

function asItems(
  raw: unknown,
  source: 'gallery' | 'pin',
): GalleryMetaItem[] {
  if (!Array.isArray(raw)) return [];
  return (raw as StoredImage[])
    .filter((img) => img?.id && typeof img.url === 'string' && img.url.length > 0)
    .map((img) => ({
      id: String(img.id),
      filename: img.filename,
      timestamp: typeof img.timestamp === 'number' ? img.timestamp : 0,
      thumbnailUrl: img.url as string,
      source,
    }));
}

export async function getGalleryMetaForWeb(): Promise<GalleryMetaItem[]> {
  const result = await storage.local.get([GALLERY_KEY, PINS_KEY]);
  const gallery = asItems(result[GALLERY_KEY], 'gallery');
  const pins = asItems(result[PINS_KEY], 'pin');
  return [...gallery, ...pins]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, MAX_ITEMS);
}

export function handleExternalGalleryMessage(
  message: { type?: string },
  sendResponse: (r: unknown) => void,
): boolean {
  if (message.type !== 'GET_GALLERY_META') return false;
  void getGalleryMetaForWeb()
    .then((images) => sendResponse({ success: true, images }))
    .catch((err: unknown) =>
      sendResponse({
        success: false,
        error: err instanceof Error ? err.message : 'Failed to load gallery',
        images: [],
      }),
    );
  return true;
}
