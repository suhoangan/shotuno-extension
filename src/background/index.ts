import { handleCaptureMessage } from './capture-handlers';
import { bindGalleryDownloadListeners, handleGalleryMessage } from './gallery-handlers';
import { handleExternalGalleryMessage } from './gallery-meta-bridge';
import { handlePinMessage } from './pin-handlers';
import { bindSidePanelLifecycle, handleSidePanelMessage } from './side-panel-handlers';
import { initTelemetry } from '../lib/telemetry';
import { bindCookieAuthListener } from './auth-sync';

function routeMessage(
  message: any,
  sendResponse: (r: any) => void,
  sender?: chrome.runtime.MessageSender,
): boolean {
  if (handleSidePanelMessage(message, sender, sendResponse)) return true;
  if (handleCaptureMessage(message, sendResponse, sender)) return true;
  if (handleGalleryMessage(message, sendResponse)) return true;
  if (handlePinMessage(message, sendResponse)) return true;
  return false;
}

bindGalleryDownloadListeners();
bindSidePanelLifecycle();
bindCookieAuthListener();
void initTelemetry();

chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
  return routeMessage(message, sendResponse, sender);
});

chrome.runtime.onMessageExternal.addListener((message, _sender, sendResponse) => {
  if (message.type === 'LOGIN_SYNC' && message.token) {
    chrome.storage.local
      .set({
        authToken: message.token,
        authUser: message.user,
      })
      .then(() => {
        sendResponse({ success: true });
      });
    return true;
  }
  if (message.type === 'LOGOUT_SYNC') {
    chrome.storage.local.remove(['authToken', 'authUser']).then(() => {
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
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: chrome.runtime.getURL('src/onboarding/index.html'),
    });
  }
});
