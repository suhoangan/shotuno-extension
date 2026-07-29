import { applyAuthMessage } from './auth-handlers';
import { handleCaptureMessage } from './capture-handlers';
import { bindGalleryDownloadListeners, handleGalleryMessage } from './gallery-handlers';
import { handlePinMessage } from './pin-handlers';
import { bindSidePanelLifecycle, handleSidePanelMessage } from './side-panel-handlers';
import { bindWebCookieAuth } from './web-cookie-auth';

function routeMessage(
  message: any,
  sendResponse: (r: any) => void,
  sender?: chrome.runtime.MessageSender,
): boolean {
  if (applyAuthMessage(message, sendResponse)) return true;
  if (handleSidePanelMessage(message, sender, sendResponse)) return true;
  if (handleCaptureMessage(message, sendResponse, sender)) return true;
  if (handleGalleryMessage(message, sendResponse)) return true;
  if (handlePinMessage(message, sendResponse)) return true;
  return false;
}

bindGalleryDownloadListeners();
bindSidePanelLifecycle();
bindWebCookieAuth();

chrome.runtime.onMessage.addListener((message: any, sender: any, sendResponse: any) => {
  return routeMessage(message, sendResponse, sender);
});

chrome.runtime.onMessageExternal.addListener((message: any, _sender: any, sendResponse: any) => {
  if (routeMessage(message, sendResponse)) return true;
  sendResponse({ success: false, error: 'Unknown message' });
  return false;
});

chrome.runtime.onInstalled.addListener((details: any) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({ url: chrome.runtime.getURL('src/onboarding/index.html') });
  }
});
