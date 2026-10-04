import { handleCaptureMessage } from './capture-handlers';
import { bindContextMenuClick, registerContextMenus } from './context-menu';
import { bindGalleryDownloadListeners, handleGalleryMessage } from './gallery-handlers';
import { handleExternalGalleryMessage } from './gallery-meta-bridge';
import { handlePinMessage } from './pin-handlers';
import { bindSidePanelLifecycle, handleSidePanelMessage } from './side-panel-handlers';
import { initTelemetry } from '../lib/telemetry';
import { storage } from '../lib/chromeStorage';
import { LANGUAGE_STORAGE_KEY } from '../lib/i18n';
import { bindActionIconListeners, syncActionPopup } from './action-icon-handler';
import { handleAutoPinSave } from './auto-pin-handler';

function routeMessage(
  message: any,
  sendResponse: (r: any) => void,
  sender?: chrome.runtime.MessageSender,
): boolean {
  if (handleSidePanelMessage(message, sender, sendResponse)) return true;
  if (handleCaptureMessage(message, sendResponse, sender)) return true;
  if (handleGalleryMessage(message, sendResponse)) return true;
  if (handleAutoPinSave(message, sendResponse)) return true;
  if (handlePinMessage(message, sendResponse)) return true;
  return false;
}

bindGalleryDownloadListeners();
bindSidePanelLifecycle();
bindContextMenuClick();
bindActionIconListeners();
void initTelemetry();

// Clean up any legacy auth keys from storage
void storage.local.remove(['authToken', 'authUser']);

chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
  if (message.type === 'SYNC_LANGUAGE' && message.payload?.language) {
    storage.local.set({ [LANGUAGE_STORAGE_KEY]: message.payload.language }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  return routeMessage(message, sendResponse, sender);
});

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SYNC_LANGUAGE' && message.payload?.language) {
    storage.local.set({ [LANGUAGE_STORAGE_KEY]: message.payload.language }).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  if (handleExternalGalleryMessage(message, sendResponse)) {
    return true;
  }
  return false;
});

chrome.runtime.onInstalled.addListener((details: any) => {
  registerContextMenus();
  void syncActionPopup();
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/onboarding/index.html'),
    });
  }
});

chrome.runtime.onStartup.addListener(() => {
  registerContextMenus();
  void syncActionPopup();
});
