/**
 * How long each local image store keeps an entry.
 *
 * Pins are a scratch space for carrying an image between tabs, so they lapse quickly.
 * Downloaded images are the user's own files, so they stay for a month — and go sooner if
 * the download is erased from disk, which the `chrome.downloads` listeners handle.
 */
export const PIN_RETENTION_MS = 3 * 24 * 60 * 60 * 1000;
export const GALLERY_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Split stored entries into the ones still inside their retention window and the ones that
 * have lapsed. Callers delete the IndexedDB blob behind every expired entry — dropping only
 * the metadata would strand the full-size image with nothing left pointing at it.
 */
export function partitionExpired<T extends { timestamp: number }>(
  items: T[],
  maxAgeMs: number,
  now: number = Date.now(),
): { kept: T[]; expired: T[] } {
  const kept: T[] = [];
  const expired: T[] = [];
  for (const item of items) {
    if (now - item.timestamp > maxAgeMs) expired.push(item);
    else kept.push(item);
  }
  return { kept, expired };
}
