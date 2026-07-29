import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';
import { handleGalleryDesktopMessage } from './gallery-desktop-handlers';
import { ensureImageExt } from '../lib/imageNames';

const GALLERY_KEY = 'canvas_gallery_images';
const MAX_GALLERY = 50;
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

type GalleryImage = {
  id: string;
  downloadId?: number;
  url: string;
  timestamp: number;
  filename?: string;
};

async function downloadExists(downloadId: number | undefined): Promise<boolean> {
  if (downloadId == null) return true;
  try {
    // `exists` can be stale unless queried explicitly.
    const items = await chrome.downloads.search({ id: downloadId, exists: true });
    return items.length > 0;
  } catch {
    return true;
  }
}

async function pruneStaleDownloads(images: GalleryImage[]): Promise<GalleryImage[]> {
  const kept: GalleryImage[] = [];
  for (const img of images) {
    if (await downloadExists(img.downloadId)) {
      kept.push(img);
    } else {
      void idbDel(`gallery_full_${img.id}`);
    }
  }
  return kept;
}

function writeGallery(images: GalleryImage[], sendResponse?: (r: unknown) => void) {
  chrome.storage.local.set({ [GALLERY_KEY]: images }, () => {
    sendResponse?.({ success: true, images });
  });
}

function removeByDownloadId(downloadId: number) {
  chrome.storage.local.get([GALLERY_KEY], (result) => {
    const current = (result[GALLERY_KEY] as GalleryImage[] | undefined) || [];
    const removed = current.filter((img) => img.downloadId === downloadId);
    if (!removed.length) return;
    const updated = current.filter((img) => img.downloadId !== downloadId);
    chrome.storage.local.set({ [GALLERY_KEY]: updated }, () => {
      removed.forEach((img) => void idbDel(`gallery_full_${img.id}`));
    });
  });
}

/** Listen for Downloads folder / history removals and drop matching gallery entries. */
export function bindGalleryDownloadListeners() {
  chrome.downloads.onErased.addListener((downloadId) => {
    removeByDownloadId(downloadId);
  });

  chrome.downloads.onChanged.addListener((delta) => {
    if (delta.exists?.current === false) {
      removeByDownloadId(delta.id);
    }
  });
}

export function handleGalleryMessage(
  message: { type: string; payload?: Record<string, unknown> },
  sendResponse: (r: unknown) => void,
): boolean {
  if (message.type === 'DOWNLOAD_AND_SAVE_IMAGE') {
    const { dataUrl, filename, thumbnailUrl } = message.payload as {
      dataUrl: string;
      filename: string;
      thumbnailUrl?: string;
    };
    const now = Date.now();

    chrome.storage.local.get(['lastDownloadTime'], (result) => {
      if (now - ((result.lastDownloadTime as number) || 0) < 2000) {
        sendResponse({ success: false, error: 'Throttled' });
        return;
      }

      chrome.storage.local.set({ lastDownloadTime: now }, () => {
        chrome.downloads.download(
          { url: dataUrl, filename: `${filename}.png`, saveAs: false },
          (downloadId?: number) => {
            if (chrome.runtime.lastError || !downloadId) {
              sendResponse({
                success: false,
                error: chrome.runtime.lastError?.message || 'Download failed',
              });
              return;
            }

            const newId = Date.now().toString();
            idbSet(`gallery_full_${newId}`, dataUrl).then(() => {
              chrome.storage.local.get([GALLERY_KEY], (res) => {
                const currentImages = (res[GALLERY_KEY] as GalleryImage[] | undefined) || [];
                const newImage: GalleryImage = {
                  id: newId,
                  downloadId,
                  url: thumbnailUrl || dataUrl,
                  timestamp: Date.now(),
                  filename: `${filename}.png`,
                };
                const updatedImages = [newImage, ...currentImages].slice(0, MAX_GALLERY);
                const keptIds = new Set(updatedImages.map((img) => img.id));
                chrome.storage.local.set({ [GALLERY_KEY]: updatedImages }, () => {
                  currentImages.forEach((img) => {
                    if (!keptIds.has(img.id)) {
                      void idbDel(`gallery_full_${img.id}`);
                    }
                  });
                  sendResponse({ success: true, image: newImage });
                });
              });
            });
          },
        );
      });
    });
    return true;
  }

  if (message.type === 'GET_FULL_IMAGE') {
    const id = (message.payload as { id: string }).id;
    idbGet(`gallery_full_${id}`).then((dataUrl) => {
      sendResponse({ dataUrl });
    });
    return true;
  }

  if (message.type === 'SYNC_GALLERY') {
    chrome.storage.local.get([GALLERY_KEY], async (result) => {
      const currentImages = (result[GALLERY_KEY] as GalleryImage[] | undefined) || [];
      const now = Date.now();
      let validImages = currentImages.filter((img) => now - img.timestamp <= THIRTY_DAYS_MS);
      const expired = currentImages.filter((img) => now - img.timestamp > THIRTY_DAYS_MS);
      expired.forEach((img) => void idbDel(`gallery_full_${img.id}`));

      validImages = await pruneStaleDownloads(validImages);
      validImages.sort((a, b) => b.timestamp - a.timestamp);

      const changed = validImages.length !== currentImages.length
        || validImages.some((img, i) => img.id !== currentImages[i]?.id);

      if (changed) {
        writeGallery(validImages, sendResponse);
      } else {
        sendResponse({ success: true, images: validImages });
      }
    });
    return true;
  }

  if (message.type === 'DELETE_GALLERY_IMAGE') {
    const { id } = message.payload as { id: string };
    chrome.storage.local.get([GALLERY_KEY], (result) => {
      const updatedImages = ((result[GALLERY_KEY] as GalleryImage[] | undefined) || []).filter(
        (img) => img.id !== id,
      );
      chrome.storage.local.set({ [GALLERY_KEY]: updatedImages }, () => {
        idbDel(`gallery_full_${id}`).then(() => sendResponse({ success: true }));
      });
    });
    return true;
  }

  if (message.type === 'DELETE_GALLERY_IMAGES') {
    const { ids } = message.payload as { ids: string[] };
    const idSet = new Set(ids);
    chrome.storage.local.get([GALLERY_KEY], (result) => {
      const updatedImages = ((result[GALLERY_KEY] as GalleryImage[] | undefined) || []).filter(
        (img) => !idSet.has(img.id),
      );
      chrome.storage.local.set({ [GALLERY_KEY]: updatedImages }, () => {
        Promise.all([...idSet].map((id) => idbDel(`gallery_full_${id}`))).then(() => {
          sendResponse({ success: true });
        });
      });
    });
    return true;
  }

  if (message.type === 'RENAME_GALLERY_IMAGE') {
    const { id, filename } = message.payload as { id: string; filename: string };
    const next = ensureImageExt(filename);
    chrome.storage.local.get([GALLERY_KEY], (result) => {
      const images = (result[GALLERY_KEY] as GalleryImage[] | undefined) || [];
      const updated = images.map((img) => (img.id === id ? { ...img, filename: next } : img));
      chrome.storage.local.set({ [GALLERY_KEY]: updated }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  return handleGalleryDesktopMessage(message, sendResponse);
}
