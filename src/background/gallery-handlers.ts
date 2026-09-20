import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';
import { handleGalleryDesktopMessage } from './gallery-desktop-handlers';
import { ensureImageExt } from '../lib/imageNames';
import { GALLERY_RETENTION_MS, partitionExpired } from './retention';
import { storage } from '../lib/chromeStorage';
import { apiClient, webUrl } from '../lib/api';


const GALLERY_KEY = 'canvas_gallery_images';
const MAX_GALLERY = 50;

type GalleryImage = {
  id: string;
  downloadId?: number;
  url: string;
  timestamp: number;
  filename?: string;
  cloudUrl?: string;
  shareId?: string;
  expiresAt?: number;
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
  storage.local.set({ [GALLERY_KEY]: images }, () => {
    sendResponse?.({ success: true, images });
  });
}

function removeByDownloadId(downloadId: number) {
  storage.local.get([GALLERY_KEY], (result) => {
    const current = (result[GALLERY_KEY] as GalleryImage[] | undefined) || [];
    const removed = current.filter((img) => img.downloadId === downloadId);
    if (!removed.length) return;
    const updated = current.filter((img) => img.downloadId !== downloadId);
    storage.local.set({ [GALLERY_KEY]: updated }, () => {
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
    const { dataUrl, filename, thumbnailUrl, format } = message.payload as {
      dataUrl: string;
      filename: string;
      thumbnailUrl?: string;
      format?: string;
    };
    const now = Date.now();

    storage.local.get(['lastDownloadTime'], (result) => {
      if (now - ((result.lastDownloadTime as number) || 0) < 2000) {
        sendResponse({ success: false, error: 'Throttled' });
        return;
      }

      storage.local.set({ lastDownloadTime: now }, () => {
        const ext = format === 'jpg' || format === 'jpeg' ? 'jpg' : format === 'webp' ? 'webp' : 'png';
        const cleanBase = filename.replace(/\.(png|jpg|jpeg|webp)$/i, '');
        chrome.downloads.download(
          { url: dataUrl, filename: `${cleanBase}.${ext}`, saveAs: false },
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
              storage.local.get([GALLERY_KEY], (res) => {
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
                storage.local.set({ [GALLERY_KEY]: updatedImages }, () => {
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
    storage.local.get([GALLERY_KEY], async (result) => {
      let currentImages = (result[GALLERY_KEY] as GalleryImage[] | undefined) || [];
      const now = Date.now();
      let cleanedShares = false;
      currentImages = currentImages.map((img) => {
        if (img.expiresAt && img.expiresAt < now) {
          cleanedShares = true;
          const { cloudUrl, shareId, expiresAt, ...rest } = img as any;
          return rest as GalleryImage;
        }
        return img;
      });

      const { kept, expired } = partitionExpired(currentImages, GALLERY_RETENTION_MS);
      expired.forEach((img) => void idbDel(`gallery_full_${img.id}`));

      let validImages = await pruneStaleDownloads(kept);
      validImages.sort((a, b) => b.timestamp - a.timestamp);

      const changed = cleanedShares || validImages.length !== currentImages.length
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
    storage.local.get([GALLERY_KEY], (result) => {
      const updatedImages = ((result[GALLERY_KEY] as GalleryImage[] | undefined) || []).filter(
        (img) => img.id !== id,
      );
      storage.local.set({ [GALLERY_KEY]: updatedImages }, () => {
        idbDel(`gallery_full_${id}`).then(() => sendResponse({ success: true }));
      });
    });
    return true;
  }

  if (message.type === 'DELETE_GALLERY_IMAGES') {
    const { ids } = message.payload as { ids: string[] };
    const idSet = new Set(ids);
    storage.local.get([GALLERY_KEY], (result) => {
      const updatedImages = ((result[GALLERY_KEY] as GalleryImage[] | undefined) || []).filter(
        (img) => !idSet.has(img.id),
      );
      storage.local.set({ [GALLERY_KEY]: updatedImages }, () => {
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
    storage.local.get([GALLERY_KEY], (result) => {
      const images = (result[GALLERY_KEY] as GalleryImage[] | undefined) || [];
      const updated = images.map((img) => (img.id === id ? { ...img, filename: next } : img));
      storage.local.set({ [GALLERY_KEY]: updated }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  if (message.type === 'SHARE_GALLERY_IMAGE') {
    const { id } = message.payload as { id: string };
    idbGet(`gallery_full_${id}`).then(async (dataUrl) => {
      if (!dataUrl) {
        sendResponse({ success: false, error: 'Local image not found' });
        return;
      }
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        
        const formData = new FormData();
        formData.append('file', blob, 'screenshot.webp');
        
        const json = await apiClient.post<any, { id: string; url?: string; expiresAt?: string }>('/screenshots/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        const shortId = json.id;
        const publicShareUrl = webUrl(`/s/${shortId}`);
        const expiresAt = json.expiresAt ? new Date(json.expiresAt).getTime() : undefined;
        
        storage.local.get([GALLERY_KEY], (result) => {
          const images = (result[GALLERY_KEY] as GalleryImage[] | undefined) || [];
          const updated = images.map((img) => 
            img.id === id ? { ...img, cloudUrl: publicShareUrl, shareId: shortId, expiresAt } : img
          );
          storage.local.set({ [GALLERY_KEY]: updated }, () => {
            sendResponse({ success: true, url: publicShareUrl, id: shortId });
          });
        });
      } catch (err: any) {
        sendResponse({ success: false, error: err.message || 'Share failed' });
      }
    });
    return true;
  }

  return handleGalleryDesktopMessage(message, sendResponse);
}
