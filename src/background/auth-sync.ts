import { apiClient, WEB_BASE } from '../lib/api';
import { storage } from '../lib/chromeStorage';


export async function syncAuthFromCookies(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.cookies) return;

  try {
    const webOrigin = new URL(WEB_BASE).origin;
    let cookie = await chrome.cookies.get({
      url: webOrigin,
      name: 'shotuno_token',
    });
    
    // Fallback for local development running on 127.0.0.1
    if (!cookie && webOrigin.includes('localhost')) {
      cookie = await chrome.cookies.get({
        url: webOrigin.replace('localhost', '127.0.0.1'),
        name: 'shotuno_token',
      });
    }

    const currentStorage = await storage.local.get([
      'authToken',
      'authUser',
    ]);

    if (!cookie?.value) {
      if (currentStorage.authToken) {
        await storage.local.remove(['authToken', 'authUser']);
      }
      return;
    }

    const rawToken = cookie.value;
    const token = decodeURIComponent(rawToken);
    if (currentStorage.authToken === token && currentStorage.authUser) {
      return;
    }

    try {
      const user = await apiClient.get<any, Record<string, unknown>>('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      await storage.local.set({
        authToken: token,
        authUser: user,
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        await storage.local.remove(['authToken', 'authUser']);
      } else {
        console.error('Failed to fetch profile during auth sync:', err);
      }
    }
  } catch (err) {
    console.error('Failed to sync auth cookie:', err);
  }
}

export async function clearExtensionAuthAndCookie(): Promise<void> {
  await storage.local.remove(['authToken', 'authUser']);
  try {
    const webOrigin = new URL(WEB_BASE).origin;
    await chrome.cookies.remove({ url: webOrigin, name: 'shotuno_token' });
  } catch {
    /* cookie may be unavailable */
  }
}

export function bindCookieAuthListener(): void {
  if (typeof chrome === 'undefined' || !chrome.cookies) return;

  void syncAuthFromCookies();

  chrome.cookies.onChanged.addListener((changeInfo) => {
    if (changeInfo.cookie.name === 'shotuno_token') {
      void syncAuthFromCookies();
    }
  });
}
