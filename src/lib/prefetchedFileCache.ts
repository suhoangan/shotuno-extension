/**
 * Gallery and pin panels prefetch full-size images so `dragstart` can attach `File`s
 * synchronously. Those are decoded blobs, the panels prefetch every visible row, and nothing
 * evicted them when an item was deleted — so a long browsing session held every image it had
 * ever shown. Cap the map and drop the least recently used entry instead.
 */
const MAX_PREFETCHED_FILES = 32;

export function createPrefetchedFileCache(
  loadDataUrl: (id: string) => Promise<string | null>,
) {
  const cache = new Map<string, File>();
  const pending = new Map<string, Promise<File | null>>();

  /** Re-inserting moves the entry to the newest end of the eviction order. */
  const touch = (id: string) => {
    const file = cache.get(id);
    if (file === undefined) return null;
    cache.delete(id);
    cache.set(id, file);
    return file;
  };

  const prefetch = (id: string, filename: string) => {
    if (cache.has(id) || pending.has(id)) return;
    const p = loadDataUrl(id)
      .then(async (dataUrl) => {
        if (!dataUrl) return null;
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], filename, { type: blob.type || 'image/png' });
        cache.set(id, file);
        while (cache.size > MAX_PREFETCHED_FILES) {
          cache.delete(cache.keys().next().value as string);
        }
        return file;
      })
      .finally(() => pending.delete(id));
    pending.set(id, p);
  };

  const attachFilesToDataTransfer = (dt: DataTransfer, ids: string[]) => {
    let added = 0;
    for (const id of ids) {
      const file = touch(id);
      if (file) {
        dt.items.add(file);
        added += 1;
      }
    }
    return added;
  };

  return { prefetch, attachFilesToDataTransfer };
}
