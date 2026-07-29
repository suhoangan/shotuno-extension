import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../lib/authCookie';
import { clearWebAuthCookie, syncSessionFromWebCookie } from './web-cookie-auth';

export function applyAuthMessage(message: any, sendResponse: (r: any) => void): boolean {
  // Cold-start / popup open: sync cookie → storage, return session (SO GET_COOKIE pattern).
  if (message.type === 'AUTH_SYNC_FROM_WEB' || message.type === 'AUTH_GET') {
    void syncSessionFromWebCookie().then((session) => {
      sendResponse({
        success: true,
        token: session.token,
        user: session.user,
      });
    });
    return true;
  }

  if (message.type === 'AUTH_LOGIN') {
    const { token, user } = message;
    chrome.storage.local.set({ [AUTH_TOKEN_KEY]: token, [AUTH_USER_KEY]: user }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'AUTH_LOGOUT') {
    void clearWebAuthCookie()
      .then(() => chrome.storage.local.remove([AUTH_TOKEN_KEY, AUTH_USER_KEY]))
      .then(() => sendResponse({ success: true }));
    return true;
  }

  return false;
}
