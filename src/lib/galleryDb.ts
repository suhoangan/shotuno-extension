export interface GalleryImage {
  id: string;
  downloadId?: number;
  url: string;
  timestamp: number;
  filename?: string;
}

type MessageResponse = {
  success?: boolean;
  image?: GalleryImage;
  images?: GalleryImage[];
  dataUrl?: string;
  error?: string;
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
): Promise<GalleryImage> {
  const response = await sendRuntimeMessage({
    type: 'DOWNLOAD_AND_SAVE_IMAGE',
    payload: { dataUrl: url, filename, thumbnailUrl },
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
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return [];
  return new Promise((resolve) => {
    chrome.storage.local.get(['canvas_gallery_images'], (result) => {
      if (chrome.runtime.lastError) {
        resolve([]);
        return;
      }
      resolve((result['canvas_gallery_images'] as GalleryImage[] | undefined) || []);
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

export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  return new File([blob], filename, { type: blob.type || 'image/png' });
}

/** Prefetch full images so dragstart can attach Files synchronously. */
export function createFullImageCache() {
  const cache = new Map<string, File>();
  const pending = new Map<string, Promise<File | null>>();

  const prefetch = (id: string, filename = `shotuno-${id}.png`) => {
    if (cache.has(id) || pending.has(id)) return;
    const p = getFullImage(id).then(async (dataUrl) => {
      if (!dataUrl) return null;
      const file = await dataUrlToFile(dataUrl, filename);
      cache.set(id, file);
      return file;
    }).finally(() => pending.delete(id));
    pending.set(id, p);
  };

  const getCached = (id: string) => cache.get(id) ?? null;

  const attachFilesToDataTransfer = (dt: DataTransfer, ids: string[]) => {
    let added = 0;
    for (const id of ids) {
      const file = cache.get(id);
      if (file) {
        dt.items.add(file);
        added += 1;
      }
    }
    return added;
  };

  return { prefetch, getCached, attachFilesToDataTransfer, cache };
}
