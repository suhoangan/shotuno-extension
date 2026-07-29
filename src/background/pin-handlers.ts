import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval';
import { PINS_STORAGE_KEY, type PinImage } from '../lib/pinDb';
import { ensureImageExt, stampedImageName } from '../lib/imageNames';
import { handlePinImportMessage } from './pin-import-handlers';
import { makePinThumbnail } from './pin-thumbnail';

const MAX_PINS = 40;

function writePins(images: PinImage[], sendResponse?: (r: unknown) => void) {
  chrome.storage.local.set({ [PINS_STORAGE_KEY]: images }, () => {
    if (chrome.runtime.lastError) {
      sendResponse?.({
        success: false,
        error: chrome.runtime.lastError.message || 'Failed to save pin metadata',
      });
      return;
    }
    sendResponse?.({ success: true, images });
  });
}

export function handlePinMessage(
  message: { type: string; payload?: Record<string, unknown> },
  sendResponse: (r: unknown) => void,
): boolean {
  if (message.type === 'SAVE_PIN_IMAGE') {
    const { dataUrl, filename, thumbnailUrl } = message.payload as {
      dataUrl: string;
      filename?: string;
      thumbnailUrl?: string;
    };
    if (!dataUrl) {
      sendResponse({ success: false, error: 'Missing image' });
      return true;
    }

    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const name = ensureImageExt(filename || stampedImageName('pin'));

    void (async () => {
      // Static import — dynamic import('./pin-thumbnail') breaks under CRX/Vite on
      // Windows ("Unable to add filesystem: <illegal path>") in the SW.
      await idbSet(`pin_full_${newId}`, dataUrl);
      const thumb = thumbnailUrl || await makePinThumbnail(dataUrl);
      chrome.storage.local.get([PINS_STORAGE_KEY], (res) => {
        if (chrome.runtime.lastError) {
          sendResponse({
            success: false,
            error: chrome.runtime.lastError.message || 'Failed to read pins',
          });
          return;
        }
        const current = (res[PINS_STORAGE_KEY] as PinImage[] | undefined) || [];
        const pin: PinImage = {
          id: newId,
          url: thumb,
          timestamp: Date.now(),
          filename: name,
        };
        const updated = [pin, ...current].slice(0, MAX_PINS);
        const kept = new Set(updated.map((p) => p.id));
        current.forEach((p) => {
          if (!kept.has(p.id)) void idbDel(`pin_full_${p.id}`);
        });
        writePins(updated, () => sendResponse({ success: true, image: pin }));
      });
    })().catch((e) => {
      const msg = e instanceof Error ? e.message : 'Failed to save pin';
      console.error('[shotuno] SAVE_PIN_IMAGE failed', e);
      sendResponse({ success: false, error: msg || 'Failed to save pin' });
    });
    return true;
  }

  if (message.type === 'GET_PIN_FULL') {
    const id = (message.payload as { id: string }).id;
    void idbGet(`pin_full_${id}`).then((dataUrl) => {
      sendResponse({ dataUrl });
    });
    return true;
  }

  if (message.type === 'SYNC_PINS') {
    chrome.storage.local.get([PINS_STORAGE_KEY], (result) => {
      const images = (result[PINS_STORAGE_KEY] as PinImage[] | undefined) || [];
      images.sort((a, b) => b.timestamp - a.timestamp);
      sendResponse({ success: true, images });
    });
    return true;
  }

  if (message.type === 'DELETE_PIN') {
    const { id } = message.payload as { id: string };
    chrome.storage.local.get([PINS_STORAGE_KEY], (result) => {
      const updated = ((result[PINS_STORAGE_KEY] as PinImage[] | undefined) || []).filter((p) => p.id !== id);
      chrome.storage.local.set({ [PINS_STORAGE_KEY]: updated }, () => {
        void idbDel(`pin_full_${id}`).then(() => sendResponse({ success: true }));
      });
    });
    return true;
  }

  if (message.type === 'DELETE_PINS') {
    const { ids } = message.payload as { ids: string[] };
    const idSet = new Set(ids);
    chrome.storage.local.get([PINS_STORAGE_KEY], (result) => {
      const updated = ((result[PINS_STORAGE_KEY] as PinImage[] | undefined) || []).filter((p) => !idSet.has(p.id));
      chrome.storage.local.set({ [PINS_STORAGE_KEY]: updated }, () => {
        Promise.all([...idSet].map((id) => idbDel(`pin_full_${id}`))).then(() => {
          sendResponse({ success: true });
        });
      });
    });
    return true;
  }

  if (message.type === 'DOWNLOAD_PIN') {
    const { id } = message.payload as { id: string };
    chrome.storage.local.get([PINS_STORAGE_KEY], async (result) => {
      const pins = (result[PINS_STORAGE_KEY] as PinImage[] | undefined) || [];
      const pin = pins.find((p) => p.id === id);
      const dataUrl = (await idbGet(`pin_full_${id}`)) as string | undefined;
      if (!dataUrl) {
        sendResponse({ success: false, error: 'Pin image missing' });
        return;
      }
      const filename = ensureImageExt(pin?.filename || stampedImageName('pin'));
      chrome.downloads.download(
        { url: dataUrl, filename, saveAs: false },
        (downloadId?: number) => {
          if (chrome.runtime.lastError || !downloadId) {
            sendResponse({
              success: false,
              error: chrome.runtime.lastError?.message || 'Download failed',
            });
            return;
          }
          sendResponse({ success: true });
        },
      );
    });
    return true;
  }

  if (message.type === 'RENAME_PIN') {
    const { id, filename } = message.payload as { id: string; filename: string };
    const next = ensureImageExt(filename);
    chrome.storage.local.get([PINS_STORAGE_KEY], (result) => {
      const pins = (result[PINS_STORAGE_KEY] as PinImage[] | undefined) || [];
      const updated = pins.map((p) => (p.id === id ? { ...p, filename: next } : p));
      chrome.storage.local.set({ [PINS_STORAGE_KEY]: updated }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }

  return handlePinImportMessage(message, sendResponse);
}
