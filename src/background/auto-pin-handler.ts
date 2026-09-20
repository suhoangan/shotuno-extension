import { set as idbSet, del as idbDel } from 'idb-keyval';
import { PINS_STORAGE_KEY, type PinImage } from '../lib/pinDb';
import { ensureImageExt, stampedImageName } from '../lib/imageNames';
import { makePinThumbnail } from './pin-thumbnail';
import { storage } from '../lib/chromeStorage';

export const MAX_AUTO_PINS = 3;

export function handleAutoPinSave(
  message: { type: string; payload?: Record<string, unknown> },
  sendResponse: (r: unknown) => void,
): boolean {
  if (message.type !== 'SAVE_AUTO_PIN_IMAGE') return false;

  const { dataUrl, filename, thumbnailUrl } = (message.payload || {}) as {
    dataUrl?: string;
    filename?: string;
    thumbnailUrl?: string;
  };

  if (!dataUrl) {
    sendResponse({ success: false, error: 'Missing image data' });
    return true;
  }

  const newId = `auto-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const name = ensureImageExt(filename || stampedImageName('pin'));

  void (async () => {
    await idbSet(`pin_full_${newId}`, dataUrl);
    const thumb = thumbnailUrl || (await makePinThumbnail(dataUrl));

    const res = await storage.local.get([PINS_STORAGE_KEY]);
    const current = ((res[PINS_STORAGE_KEY] as PinImage[] | undefined) || []);

    // Find existing auto-pinned items sorted by timestamp (oldest first)
    const autoPins = current.filter((p) => p.isAutoPin);
    const idsToRemove = new Set<string>();

    if (autoPins.length >= MAX_AUTO_PINS) {
      // Sort to find oldest
      const sortedAutoPins = [...autoPins].sort((a, b) => a.timestamp - b.timestamp);
      const excessCount = autoPins.length - MAX_AUTO_PINS + 1;
      const toEvict = sortedAutoPins.slice(0, excessCount);
      toEvict.forEach((p) => {
        idsToRemove.add(p.id);
        void idbDel(`pin_full_${p.id}`);
      });
    }

    const newPin: PinImage = {
      id: newId,
      url: thumb,
      timestamp: Date.now(),
      filename: name,
      isAutoPin: true,
    };

    // Filter out evicted pins and prepend the new one
    const updated = [newPin, ...current.filter((p) => !idsToRemove.has(p.id))];

    await storage.local.set({ [PINS_STORAGE_KEY]: updated });
    sendResponse({ success: true, image: newPin, images: updated });
  })().catch((err) => {
    console.error('[shotuno] handleAutoPinSave failed', err);
    sendResponse({ success: false, error: err instanceof Error ? err.message : 'Failed to save auto-pin' });
  });

  return true;
}
