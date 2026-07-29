import { get as idbGet } from 'idb-keyval';

const GALLERY_KEY = 'canvas_gallery_images';

type GalleryImage = {
  id: string;
  downloadId?: number;
  url: string;
  timestamp: number;
  filename?: string;
};

async function downloadExists(downloadId: number | undefined): Promise<boolean> {
  if (downloadId == null) return false;
  try {
    // `exists` can be stale unless queried explicitly.
    const items = await chrome.downloads.search({ id: downloadId, exists: true });
    return items.length > 0;
  } catch {
    return false;
  }
}

function downloadFilename(img: GalleryImage | undefined, id: string) {
  return (img?.filename || `shotuno-${id}`).replace(/\.png$/i, '');
}

/** Re-download or reveal gallery files on the user's desktop. */
export function handleGalleryDesktopMessage(
  message: { type: string; payload?: Record<string, unknown> },
  sendResponse: (r: unknown) => void,
): boolean {
  if (message.type === 'REDOWNLOAD_GALLERY_IMAGE') {
    const { id } = message.payload as { id: string };
    chrome.storage.local.get([GALLERY_KEY], async (result) => {
      const images = (result[GALLERY_KEY] as GalleryImage[] | undefined) || [];
      const img = images.find((i) => i.id === id);
      const dataUrl = (await idbGet(`gallery_full_${id}`)) as string | undefined;
      if (!dataUrl) {
        sendResponse({ success: false, error: 'Image data missing' });
        return;
      }
      chrome.downloads.download(
        { url: dataUrl, filename: `${downloadFilename(img, id)}.png`, saveAs: false },
        (downloadId?: number) => {
          if (chrome.runtime.lastError || !downloadId) {
            sendResponse({
              success: false,
              error: chrome.runtime.lastError?.message || 'Download failed',
            });
            return;
          }
          const updated = images.map((i) => (i.id === id ? { ...i, downloadId } : i));
          chrome.storage.local.set({ [GALLERY_KEY]: updated }, () => {
            sendResponse({ success: true });
          });
        },
      );
    });
    return true;
  }

  if (message.type === 'OPEN_GALLERY_ON_DESKTOP') {
    const { id } = message.payload as { id: string };
    chrome.storage.local.get([GALLERY_KEY], async (result) => {
      const images = (result[GALLERY_KEY] as GalleryImage[] | undefined) || [];
      const img = images.find((i) => i.id === id);
      let downloadId = img?.downloadId;

      if (downloadId == null || !(await downloadExists(downloadId))) {
        const dataUrl = (await idbGet(`gallery_full_${id}`)) as string | undefined;
        if (!dataUrl) {
          sendResponse({ success: false, error: 'File not found on desktop' });
          return;
        }
        downloadId = await new Promise<number | undefined>((resolve) => {
          chrome.downloads.download(
            { url: dataUrl, filename: `${downloadFilename(img, id)}.png`, saveAs: false },
            (newId?: number) => {
              if (chrome.runtime.lastError || !newId) {
                resolve(undefined);
                return;
              }
              const updated = images.map((i) => (i.id === id ? { ...i, downloadId: newId } : i));
              chrome.storage.local.set({ [GALLERY_KEY]: updated }, () => resolve(newId));
            },
          );
        });
      }

      if (downloadId == null) {
        sendResponse({ success: false, error: 'File not found on desktop' });
        return;
      }
      try {
        chrome.downloads.show(downloadId);
        sendResponse({ success: true });
      } catch (e) {
        sendResponse({
          success: false,
          error: e instanceof Error ? e.message : 'Could not open on desktop',
        });
      }
    });
    return true;
  }

  return false;
}
