import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval';
import { PINS_STORAGE_KEY, type PinImage } from '../lib/pinDb';
import { ensureImageExt, filenameFromUrl, stampedImageName } from '../lib/imageNames';
import { makePinThumbnail } from './pin-thumbnail';

const MAX_PINS = 40;
const FETCH_TIMEOUT_MS = 10_000;
const IMPORT_HARD_TIMEOUT_MS = 45_000;
const MAX_IMPORT_URLS = 8;

/** Serialize imports / bulk downloads so rapid drops don't race storage. */
let workQueue: Promise<unknown> = Promise.resolve();

function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  const run = workQueue.then(fn, fn);
  workQueue = run.then(() => undefined, () => undefined);
  return run;
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(label)), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error('read failed'));
    reader.readAsDataURL(blob);
  });
}

async function urlToDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:')) return url;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, credentials: 'omit', redirect: 'follow' });
    if (!res.ok) throw new Error(`Fetch failed (${res.status})`);
    const blob = await res.blob();
    const type = blob.type || '';
    if (type && !type.startsWith('image/') && !type.includes('octet-stream')) {
      throw new Error('Not an image');
    }
    if (blob.size > 25 * 1024 * 1024) throw new Error('Image too large');
    return blobToDataUrl(blob);
  } finally {
    clearTimeout(timer);
  }
}

async function appendPinsBatch(
  items: Array<{ dataUrl: string; filename: string }>,
): Promise<PinImage[]> {
  if (!items.length) return [];
  const result = await chrome.storage.local.get([PINS_STORAGE_KEY]);
  let current = (result[PINS_STORAGE_KEY] as PinImage[] | undefined) || [];
  const saved: PinImage[] = [];

  for (const item of items) {
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await idbSet(`pin_full_${newId}`, item.dataUrl);
    const thumb = await makePinThumbnail(item.dataUrl);
    const filename = ensureImageExt(item.filename);
    const pin: PinImage = {
      id: newId,
      url: thumb,
      timestamp: Date.now(),
      filename,
    };
    current = [pin, ...current].slice(0, MAX_PINS);
    saved.push(pin);
  }

  const kept = new Set(current.map((p) => p.id));
  const previous = (result[PINS_STORAGE_KEY] as PinImage[] | undefined) || [];
  previous.forEach((p) => {
    if (!kept.has(p.id)) void idbDel(`pin_full_${p.id}`);
  });
  await chrome.storage.local.set({ [PINS_STORAGE_KEY]: current });
  return saved;
}

/** Import remote / data-URL images into Pins (used by side-panel web DnD). */
export function handlePinImportMessage(
  message: { type: string; payload?: Record<string, unknown> },
  sendResponse: (r: unknown) => void,
): boolean {
  if (message.type === 'IMPORT_WEB_TO_PINS') {
    const { urls = [], dataUrls = [] } = (message.payload || {}) as {
      urls?: string[];
      dataUrls?: string[];
    };

    void enqueue(async () => {
      await withTimeout((async () => {
        const limitedData = dataUrls.slice(0, MAX_IMPORT_URLS);
        const limitedUrls = urls.slice(0, Math.max(0, MAX_IMPORT_URLS - limitedData.length));
        const prepared: Array<{ dataUrl: string; filename: string }> = [];
        let failCount = 0;

        for (const dataUrl of limitedData) {
          prepared.push({ dataUrl, filename: stampedImageName('drop') });
        }

        for (const url of limitedUrls) {
          try {
            const dataUrl = await urlToDataUrl(url);
            prepared.push({ dataUrl, filename: filenameFromUrl(url, 'drop') });
          } catch {
            failCount += 1;
          }
        }

        const saved = await appendPinsBatch(prepared);
        sendResponse({
          success: saved.length > 0,
          images: saved,
          count: saved.length,
          error: saved.length === 0
            ? (failCount ? 'Could not load image(s) — try again' : 'Nothing to import')
            : failCount
              ? `Pinned ${saved.length}; skipped ${failCount}`
              : undefined,
        });
      })(), IMPORT_HARD_TIMEOUT_MS, 'Import timed out');
    }).catch((e) => {
      sendResponse({
        success: false,
        error: e instanceof Error ? e.message : 'Import failed',
      });
    });
    return true;
  }

  if (message.type === 'DOWNLOAD_PINS') {
    const { ids } = message.payload as { ids: string[] };
    void enqueue(async () => {
      const result = await chrome.storage.local.get([PINS_STORAGE_KEY]);
      const pins = (result[PINS_STORAGE_KEY] as PinImage[] | undefined) || [];
      let ok = 0;
      for (const id of ids.slice(0, MAX_PINS)) {
        const pin = pins.find((p) => p.id === id);
        const dataUrl = (await idbGet(`pin_full_${id}`)) as string | undefined;
        if (!dataUrl) continue;
        const filename = ensureImageExt(pin?.filename || stampedImageName('pin'));
        const downloadId = await new Promise<number | undefined>((resolve) => {
          chrome.downloads.download(
            { url: dataUrl, filename, saveAs: false },
            (idNum?: number) => {
              if (chrome.runtime.lastError || !idNum) resolve(undefined);
              else resolve(idNum);
            },
          );
        });
        if (downloadId) ok += 1;
        await new Promise((r) => setTimeout(r, 300));
      }
      sendResponse({
        success: ok > 0,
        count: ok,
        error: ok === 0 ? 'Download failed' : undefined,
      });
    }).catch(() => {
      sendResponse({ success: false, error: 'Download failed' });
    });
    return true;
  }

  return false;
}
