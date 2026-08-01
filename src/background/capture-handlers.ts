import { captureFullSizeScreenshot } from './captureFullSizeScreenshot';

type CaptureSender = { tab?: { id?: number; windowId?: number } };

async function resolveTargetTabId(
  payloadTabId: number | undefined,
  sender: CaptureSender | undefined,
): Promise<number | undefined> {
  if (payloadTabId != null) return payloadTabId;
  if (sender?.tab?.id != null) return sender.tab.id;

  // Side panel / popup: prefer the window the user was last focused on.
  const focused = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (focused[0]?.id != null) return focused[0].id;

  const current = await chrome.tabs.query({ active: true, currentWindow: true });
  return current[0]?.id;
}

async function pingContentScript(tabId: number): Promise<boolean> {
  try {
    await chrome.tabs.sendMessage(tabId, { type: 'SHOTUNO_PING' });
    return true;
  } catch {
    return false;
  }
}

async function ensureContentScript(tabId: number): Promise<void> {
  if (await pingContentScript(tabId)) return;

  // Script may still be starting (manifest inject) — retry once before forcing inject.
  await new Promise((r) => setTimeout(r, 80));
  if (await pingContentScript(tabId)) return;

  const manifest = chrome.runtime.getManifest();
  const scripts = manifest.content_scripts ?? [];
  for (const entry of scripts) {
    const world = (entry as { world?: string }).world;
    if (world && world !== 'ISOLATED') continue;
    const files = entry.js;
    if (!files?.length) continue;
    // Only the main isolated content script (Konva lives here). Skip MAIN-world bridges.
    await chrome.scripting.executeScript({ target: { tabId }, files });
    break;
  }

  // Bootstrap is async — wait/retry until PING responds or give up.
  for (let i = 0; i < 8; i++) {
    await new Promise((r) => setTimeout(r, 60));
    if (await pingContentScript(tabId)) return;
  }
}

async function sendCaptureToTab(tabId: number, message: { type: string; payload?: unknown }) {
  try {
    await chrome.tabs.sendMessage(tabId, message);
  } catch {
    await ensureContentScript(tabId);
    await chrome.tabs.sendMessage(tabId, message);
  }
}

export function handleCaptureMessage(
  message: any,
  sendResponse: (r: any) => void,
  sender?: CaptureSender,
): boolean {
  if (message.type === 'INITIATE_CAPTURE') {
    const { captureType, tabId: payloadTabId } = message.payload as {
      captureType: string;
      tabId?: number;
    };

    void (async () => {
      try {
        const tabId = await resolveTargetTabId(payloadTabId, sender);
        if (tabId == null) {
          sendResponse({ success: false, error: 'No active tab to capture' });
          return;
        }

        if (captureType === 'visible') {
          await new Promise((r) => setTimeout(r, 300));
          const dataUrl = await chrome.tabs.captureVisibleTab({ format: 'png' });
          await sendCaptureToTab(tabId, { type: 'TOGGLE_EDITOR', payload: dataUrl });
          sendResponse({ success: true });
          return;
        }

        if (captureType === 'area') {
          await sendCaptureToTab(tabId, { type: 'START_AREA_SELECTION' });
          sendResponse({ success: true });
          return;
        }

        if (captureType === 'pin_area') {
          await sendCaptureToTab(tabId, { type: 'START_PIN_AREA_SELECTION' });
          sendResponse({ success: true });
          return;
        }

        if (captureType === 'multi_pin_area') {
          await sendCaptureToTab(tabId, { type: 'START_MULTI_PIN_AREA_SELECTION' });
          sendResponse({ success: true });
          return;
        }

        if (captureType === 'full') {
          // Prefer DevTools-style CDP full-size capture; fall back to scroll-stitch.
          await new Promise((r) => setTimeout(r, 300));
          try {
            const dataUrl = await captureFullSizeScreenshot(tabId);
            await sendCaptureToTab(tabId, { type: 'TOGGLE_EDITOR', payload: dataUrl });
          } catch {
            await sendCaptureToTab(tabId, { type: 'START_FULL_PAGE_CAPTURE' });
          }
          sendResponse({ success: true });
          return;
        }

        sendResponse({ success: false, error: `Unknown capture type: ${captureType}` });
      } catch (e) {
        const err = e as Error;
        sendResponse({
          success: false,
          error: err?.message || 'Could not start capture — refresh the tab and try again',
        });
      }
    })();

    return true;
  }

  if (message.type === 'CAPTURE_VISIBLE_TAB') {
    chrome.tabs.captureVisibleTab({ format: 'png' }, (dataUrl: string) => {
      if (chrome.runtime.lastError) {
        sendResponse({ error: chrome.runtime.lastError.message });
        return;
      }
      sendResponse({ dataUrl });
    });
    return true;
  }

  // Side panel Pins/Downloads "Edit" — ensure content script, then open editor.
  if (message.type === 'OPEN_EDITOR') {
    const dataUrl = (message.payload as { dataUrl?: string } | undefined)?.dataUrl;
    if (!dataUrl) {
      sendResponse({ success: false, error: 'Missing image' });
      return true;
    }
    void (async () => {
      try {
        const tabId = await resolveTargetTabId(undefined, sender);
        if (tabId == null) {
          sendResponse({ success: false, error: 'No active tab' });
          return;
        }
        await sendCaptureToTab(tabId, { type: 'TOGGLE_EDITOR', payload: dataUrl });
        sendResponse({ success: true });
      } catch (e) {
        sendResponse({
          success: false,
          error: e instanceof Error ? e.message : 'Could not open editor — refresh the tab',
        });
      }
    })();
    return true;
  }

  return false;
}
