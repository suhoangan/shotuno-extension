import { SIDE_PANEL_OPEN_KEY } from '../lib/sidePanelUi';
import { storage } from '../lib/chromeStorage';


/** In-memory flag so toggle can open() without awaiting (keeps user gesture). */
let sidePanelOpenCache = false;

export function getSidePanelOpenCache() {
  return sidePanelOpenCache;
}

export async function setSidePanelOpen(open: boolean) {
  sidePanelOpenCache = open;
  // local so content scripts receive onChanged reliably
  await storage.local.set({ [SIDE_PANEL_OPEN_KEY]: open });
  try {
    await storage.session.set({ [SIDE_PANEL_OPEN_KEY]: open });
  } catch {
    /* session optional */
  }
  chrome.runtime.sendMessage({ type: 'SIDE_PANEL_OPEN_CHANGED', open }).catch(() => {});
}

async function resolveWindowId(sender?: chrome.runtime.MessageSender): Promise<number | undefined> {
  if (sender?.tab?.windowId != null) return sender.tab.windowId;
  try {
    const win = await chrome.windows.getCurrent();
    return win.id;
  } catch {
    return undefined;
  }
}

async function syncOpenFromContexts(): Promise<boolean> {
  try {
    if (chrome.runtime.getContexts) {
      const contexts = await chrome.runtime.getContexts({
        contextTypes: [chrome.runtime.ContextType.SIDE_PANEL],
      });
      const open = contexts.length > 0;
      await setSidePanelOpen(open);
      return open;
    }
  } catch {
    /* ignore */
  }
  return sidePanelOpenCache;
}

async function closeSidePanel(windowId: number) {
  try {
    await chrome.sidePanel.close({ windowId });
  } catch {
    chrome.runtime.sendMessage({ type: 'CLOSE_SIDE_PANEL' }).catch(() => {});
  }
  await setSidePanelOpen(false);
}

export function bindSidePanelLifecycle() {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(() => {});

  try {
    chrome.sidePanel.onClosed.addListener(() => {
      void setSidePanelOpen(false);
    });
  } catch {
    /* onClosed may be unavailable on older Chrome */
  }

  void syncOpenFromContexts();
}

/** Handles OPEN / TOGGLE / READY / CLOSE_ACK side panel messages. */
export function handleSidePanelMessage(
  message: { type: string },
  sender: chrome.runtime.MessageSender | undefined,
  sendResponse: (r: unknown) => void,
): boolean {
  if (message.type === 'SIDE_PANEL_READY') {
    void setSidePanelOpen(true).then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'SIDE_PANEL_CLOSED') {
    void setSidePanelOpen(false).then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'GET_SIDE_PANEL_OPEN') {
    void syncOpenFromContexts().then((open) => sendResponse({ open }));
    return true;
  }

  if (message.type === 'OPEN_SIDE_PANEL' || message.type === 'TOGGLE_SIDE_PANEL') {
    const wantsToggle = message.type === 'TOGGLE_SIDE_PANEL';
    const windowIdSync = sender?.tab?.windowId;

    const run = async (windowId: number) => {
      try {
        if (wantsToggle && sidePanelOpenCache) {
          await closeSidePanel(windowId);
          sendResponse({ success: true, open: false });
          return;
        }

        await chrome.sidePanel.open({ windowId });
        await setSidePanelOpen(true);
        sendResponse({ success: true, open: true });
      } catch (e) {
        const err = e as Error;
        sendResponse({ success: false, error: err?.message || 'Could not toggle side panel' });
      }
    };

    if (windowIdSync != null) {
      void run(windowIdSync);
      return true;
    }

    void resolveWindowId(sender).then((windowId) => {
      if (windowId == null) {
        sendResponse({ success: false, error: 'No window for side panel' });
        return;
      }
      void run(windowId);
    });
    return true;
  }

  return false;
}
