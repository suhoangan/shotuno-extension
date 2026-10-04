import { createPrefetchedFileCache } from './prefetchedFileCache';
import { storage } from '../lib/chromeStorage';


export interface GalleryImage {
  id: string;
  downloadId?: number;
  url: string;
  timestamp: number;
  filename?: string;
  batchId?: string;
  cloudUrl?: string;
  shareId?: string;
  expiresAt?: number;
}

type MessageResponse = {
  success?: boolean;
  image?: GalleryImage;
  images?: GalleryImage[];
  dataUrl?: string;
  error?: string;
  url?: string;
  id?: string;
};

function sendRuntimeMessage<T = MessageResponse>(message: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      reject(new Error('Chrome extension environment not detected'));
      return;
    }
    chrome.runtime.sendMessage(message, (response: T) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve(response);
    });
  });
}

export async function saveGalleryImage(
  url: string,
  filename: string,
  thumbnailUrl?: string,
  format?: string,
): Promise<GalleryImage> {
  const response = await sendRuntimeMessage({
    type: 'DOWNLOAD_AND_SAVE_IMAGE',
    payload: { dataUrl: url, filename, thumbnailUrl, format },
  });
  if (response?.success && response.image) {
    return response.image;
  }
  throw new Error(response?.error || 'Failed to download and save');
}

export async function syncGalleryImages(): Promise<GalleryImage[]> {
  try {
    const response = await sendRuntimeMessage({ type: 'SYNC_GALLERY' });
    return response?.images || [];
  } catch {
    return [];
  }
}

export async function loadGalleryImages(): Promise<GalleryImage[]> {
  if (!storage.isAvailable()) return [];
  return new Promise((resolve) => {
    storage.local.get(['canvas_gallery_images'], (result) => {
      if (chrome.runtime.lastError) {
        resolve([]);
        return;
      }
      const raw = (result['canvas_gallery_images'] as GalleryImage[] | undefined) || [];
      const now = Date.now();
      let changed = false;
      const cleaned = raw.map((img) => {
        if (img.expiresAt && img.expiresAt < now) {
          changed = true;
          const { cloudUrl: _c, shareId: _s, expiresAt: _e, ...rest } = img;
          return rest as GalleryImage;
        }
        return img;
      });
      if (changed) {
        storage.local.set({ canvas_gallery_images: cleaned });
      }
      resolve(cleaned);
    });
  });
}

export async function getFullImage(id: string): Promise<string | null> {
  try {
    const response = await sendRuntimeMessage({
      type: 'GET_FULL_IMAGE',
      payload: { id },
    });
    return response?.dataUrl || null;
  } catch {
    return null;
  }
}

export async function deleteGalleryImage(id: string): Promise<void> {
  try {
    await sendRuntimeMessage({ type: 'DELETE_GALLERY_IMAGE', payload: { id } });
  } catch {
    /* ignore */
  }
}

export async function deleteGalleryImages(ids: string[]): Promise<void> {
  if (!ids.length) return;
  try {
    await sendRuntimeMessage({ type: 'DELETE_GALLERY_IMAGES', payload: { ids } });
  } catch {
    /* ignore */
  }
}

export async function renameGalleryImage(id: string, filename: string): Promise<void> {
  const response = await sendRuntimeMessage({
    type: 'RENAME_GALLERY_IMAGE',
    payload: { id, filename },
  });
  if (!response?.success) throw new Error(response?.error || 'Rename failed');
}

/** Re-save the image to the Downloads folder. */
export async function redownloadGalleryImage(id: string): Promise<void> {
  const response = await sendRuntimeMessage({
    type: 'REDOWNLOAD_GALLERY_IMAGE',
    payload: { id },
  });
  if (!response?.success) {
    throw new Error(response?.error || 'Download failed');
  }
}

/** Reveal / open the saved file on the user's desktop (Downloads folder). */
export async function openGalleryOnDesktop(id: string): Promise<void> {
  const response = await sendRuntimeMessage({
    type: 'OPEN_GALLERY_ON_DESKTOP',
    payload: { id },
  });
  if (!response?.success) {
    throw new Error(response?.error || 'Could not open on desktop');
  }
}

/** Prefetch full images so dragstart can attach Files synchronously. */
export function createFullImageCache() {
  return createPrefetchedFileCache(getFullImage);
}
