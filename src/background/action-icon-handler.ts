import { getCaptureSettings, onCaptureSettingsChange, type ExtensionIconAction } from '../lib/captureSettings';
import { startCaptureForTab } from './capture-handlers';

function isRestrictedUrl(url?: string): boolean {
  if (!url) return true;
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.includes('chromewebstore.google.com')
  );
}

export async function syncActionPopup(iconAction?: ExtensionIconAction): Promise<void> {
  const action = iconAction ?? (await getCaptureSettings()).iconAction;
  if (action === 'popup') {
    await chrome.action.setPopup({ popup: 'src/popup/index.html' });
  } else {
    await chrome.action.setPopup({ popup: '' });
  }
}

export function bindActionIconListeners(): void {
  // Sync popup mode on startup / background awakening
  void syncActionPopup();

  // Keep synced whenever user changes settings
  onCaptureSettingsChange((settings) => {
    void syncActionPopup(settings.iconAction);
  });

  // Handle icon clicks when popup is disabled (fast capture mode)
  chrome.action.onClicked.addListener(async (tab) => {
    if (!tab.id) return;

    if (isRestrictedUrl(tab.url)) {
      // Fall back to opening options/settings or alert
      await chrome.runtime.openOptionsPage();
      return;
    }

    const settings = await getCaptureSettings();
    if (settings.iconAction === 'popup') return;

    try {
      await startCaptureForTab(tab.id, settings.iconAction, {
        windowId: tab.windowId,
        settleMs: 100,
      });
    } catch (e) {
      console.error('Fast capture trigger failed:', e);
    }
  });
}
