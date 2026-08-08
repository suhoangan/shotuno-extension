import { CAPTURE_MENU_TITLES, CAPTURE_TYPES, type CaptureType } from '../lib/captureModes';
import { openEditorWithDataUrl, startCaptureForTab } from './capture-handlers';

const PARENT_ID = 'shotuno';
const OPEN_LIBRARY_ID = 'shotuno-open-library';
const ANNOTATE_IMAGE_ID = 'shotuno-annotate-image';

const MAX_ANNOTATE_BYTES = 25 * 1024 * 1024;
const ANNOTATE_TIMEOUT_MS = 20_000;

let registerChain: Promise<void> = Promise.resolve();

function menuIdForCapture(type: CaptureType): string {
  return `shotuno-capture-${type}`;
}

function captureTypeFromMenuId(menuItemId: string | number): CaptureType | null {
  const id = String(menuItemId);
  const prefix = 'shotuno-capture-';
  if (!id.startsWith(prefix)) return null;
  const type = id.slice(prefix.length);
  return (CAPTURE_TYPES as readonly string[]).includes(type) ? (type as CaptureType) : null;
}

function isRestrictedUrl(url: string | undefined): boolean {
  if (!url) return true;
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://')
  );
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  const base64 = btoa(binary);
  const mime = blob.type && blob.type !== 'application/octet-stream'
    ? blob.type
    : 'image/png';
  return `data:${mime};base64,${base64}`;
}

async function annotateImageFromUrl(tabId: number, srcUrl: string): Promise<void> {
  if (srcUrl.startsWith('data:image/')) {
    await openEditorWithDataUrl(tabId, srcUrl);
    return;
  }

  // blob: lives in the page world — resolve there, then open editor.
  if (srcUrl.startsWith('blob:')) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: async (url: string) => {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Could not read blob image'));
          reader.readAsDataURL(blob);
        });
      },
      args: [srcUrl],
    });
    if (typeof result !== 'string' || !result.startsWith('data:')) {
      throw new Error('Could not read blob image from page');
    }
    await openEditorWithDataUrl(tabId, result);
    return;
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ANNOTATE_TIMEOUT_MS);
  try {
    const res = await fetch(srcUrl, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`Could not fetch image (${res.status})`);
    const blob = await res.blob();
    const type = blob.type || '';
    if (type && !type.startsWith('image/') && !type.includes('octet-stream')) {
      throw new Error('URL is not an image');
    }
    if (blob.size > MAX_ANNOTATE_BYTES) {
      throw new Error('Image is too large to annotate');
    }
    await openEditorWithDataUrl(tabId, await blobToDataUrl(blob));
  } finally {
    clearTimeout(timer);
  }
}

async function openLibrary(windowId: number | undefined): Promise<void> {
  if (windowId != null) {
    await chrome.sidePanel.open({ windowId });
    return;
  }
  const win = await chrome.windows.getCurrent();
  if (win.id != null) await chrome.sidePanel.open({ windowId: win.id });
}

function createMenus(): Promise<void> {
  return new Promise((resolve) => {
    chrome.contextMenus.removeAll(() => {
      const pageContexts = ['page', 'frame', 'image'] as const;
      const create = (item: chrome.contextMenus.CreateProperties) => {
        chrome.contextMenus.create(item, () => {
          if (chrome.runtime.lastError) {
            console.warn('[shotuno] contextMenus.create', chrome.runtime.lastError.message);
          }
        });
      };

      create({ id: PARENT_ID, title: 'Shotuno', contexts: [...pageContexts] });
      for (const type of CAPTURE_TYPES) {
        create({
          id: menuIdForCapture(type),
          parentId: PARENT_ID,
          title: CAPTURE_MENU_TITLES[type],
          contexts: [...pageContexts],
        });
      }
      create({
        id: OPEN_LIBRARY_ID,
        parentId: PARENT_ID,
        title: 'Open pins & gallery',
        contexts: [...pageContexts],
      });
      create({
        id: ANNOTATE_IMAGE_ID,
        parentId: PARENT_ID,
        title: 'Annotate image',
        contexts: ['image'],
      });
      resolve();
    });
  });
}

/** Serialized menu registration for install / startup only. */
export function registerContextMenus(): void {
  registerChain = registerChain.then(() => createMenus()).catch((e) => {
    console.error('[shotuno] Failed to register context menus', e);
  });
}

export function bindContextMenuClick(): void {
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    void (async () => {
      try {
        if (tab?.id == null) return;
        const { id: tabId, windowId, url } = tab;

        if (String(info.menuItemId) === OPEN_LIBRARY_ID) {
          await openLibrary(windowId);
          return;
        }

        if (isRestrictedUrl(url)) {
          console.warn('[shotuno] Context capture skipped — restricted page');
          return;
        }

        if (String(info.menuItemId) === ANNOTATE_IMAGE_ID) {
          if (!info.srcUrl) return;
          await annotateImageFromUrl(tabId, info.srcUrl);
          return;
        }

        const captureType = captureTypeFromMenuId(info.menuItemId);
        if (captureType) {
          await startCaptureForTab(tabId, captureType, {
            windowId,
            settleMs: 0,
          });
        }
      } catch (e) {
        console.error('[shotuno] Context menu action failed', e);
      }
    })();
  });
}
