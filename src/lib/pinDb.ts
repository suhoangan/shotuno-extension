import { createPrefetchedFileCache } from './prefetchedFileCache';
import { storage } from '../lib/chromeStorage';


export const PINS_STORAGE_KEY = 'shotuno_pins';

export type PinImage = {
  id: string;
  url: string;
  timestamp: number;
  filename?: string;
  batchId?: string;
  cloudUrl?: string;
  shareId?: string;
};

type MessageResponse = {
  success?: boolean;
  image?: PinImage;
  images?: PinImage[];
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

export async function savePinImage(dataUrl: string, filename?: string): Promise<PinImage> {
  const response = await sendRuntimeMessage({
    type: 'SAVE_PIN_IMAGE',
    payload: { dataUrl, filename },
  });
  if (response?.success && response.image) return response.image;
  throw new Error(response?.error || 'Failed to save pin');
}

export async function savePinImagesBatch(dataUrls: string[], batchId: string): Promise<PinImage[]> {
  const response = await sendRuntimeMessage({
    type: 'SAVE_PIN_IMAGES_BATCH',
    payload: { dataUrls, batchId },
  });
  if (response?.success && response.images) return response.images;
  throw new Error(response?.error || 'Failed to save pin batch');
}

export async function syncPins(): Promise<PinImage[]> {
  try {
    const response = await sendRuntimeMessage({ type: 'SYNC_PINS' });
    return response?.images || [];
  } catch {
    return [];
  }
}

export async function loadPins(): Promise<PinImage[]> {
  if (!storage.isAvailable()) return [];
  return new Promise((resolve) => {
    storage.local.get([PINS_STORAGE_KEY], (result) => {
      if (chrome.runtime.lastError) {
        resolve([]);
        return;
      }
      resolve((result[PINS_STORAGE_KEY] as PinImage[] | undefined) || []);
    });
  });
}

export async function getPinFullImage(id: string): Promise<string | null> {
  try {
    const response = await sendRuntimeMessage({ type: 'GET_PIN_FULL', payload: { id } });
    return response?.dataUrl || null;
  } catch {
    return null;
  }
}

export async function deletePin(id: string): Promise<void> {
  try {
    await sendRuntimeMessage({ type: 'DELETE_PIN', payload: { id } });
  } catch {
    /* ignore */
  }
}

export async function deletePins(ids: string[]): Promise<void> {
  if (!ids.length) return;
  try {
    await sendRuntimeMessage({ type: 'DELETE_PINS', payload: { ids } });
  } catch {
    /* ignore */
  }
}

export async function renamePin(id: string, filename: string): Promise<void> {
  const response = await sendRuntimeMessage({ type: 'RENAME_PIN', payload: { id, filename } });
  if (!response?.success) throw new Error(response?.error || 'Rename failed');
}

export async function updatePin(id: string, patch: Partial<PinImage>): Promise<void> {
  const response = await sendRuntimeMessage({ type: 'UPDATE_PIN', payload: { id, patch } });
  if (!response?.success) throw new Error(response?.error || 'Update failed');
}

/** Save a pin image into the browser Downloads folder. */
export async function downloadPinImage(id: string): Promise<void> {
  const response = await sendRuntimeMessage({ type: 'DOWNLOAD_PIN', payload: { id } });
  if (!response?.success) {
    throw new Error(response?.error || 'Download failed');
  }
}

/** Download many pins into the Downloads folder. */
export async function downloadPinImages(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  const response = await sendRuntimeMessage<{ success?: boolean; count?: number; error?: string }>({
    type: 'DOWNLOAD_PINS',
    payload: { ids },
  });
  if (!response?.success) {
    throw new Error(response?.error || 'Download failed');
  }
  return response.count || 0;
}

/** Import images dropped from a web page (files as data URLs + remote URLs). */
export async function importWebToPins(input: {
  dataUrls?: string[];
  urls?: string[];
}): Promise<number> {
  const response = await sendRuntimeMessage<{ success?: boolean; count?: number; error?: string }>({
    type: 'IMPORT_WEB_TO_PINS',
    payload: input,
  });
  if (!response?.success) {
    throw new Error(response?.error || 'Could not import images');
  }
  return response.count || 0;
}

export async function startPinAreaCapture(tabId?: number): Promise<void> {
  const response = await sendRuntimeMessage<{ success?: boolean; error?: string }>({
    type: 'INITIATE_CAPTURE',
    payload: { captureType: 'pin_area', tabId },
  });
  if (!response?.success) {
    throw new Error(response?.error || 'Could not start pin capture');
  }
}

/** Prefetch pin files for sync drag-and-drop into SaaS inputs. */
export function createPinFileCache() {
  return createPrefetchedFileCache(getPinFullImage);
}
