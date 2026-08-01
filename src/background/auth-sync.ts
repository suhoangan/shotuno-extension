import { apiUrl, WEB_BASE } from '../lib/api';
import { unwrapApi } from '../lib/unwrapApi';

export async function syncAuthFromCookies(): Promise<void> {
  if (typeof chrome === 'undefined' || !chrome.cookies) return;

  try {
    const webOrigin = new URL(WEB_BASE).origin;
    const cookie = await chrome.cookies.get({
      url: webOrigin,
      name: 'shotuno_token',
    });
    const currentStorage = await chrome.storage.local.get([
      'authToken',
      'authUser',
    ]);

    if (!cookie?.value) {
      if (currentStorage.authToken) {
        await chrome.storage.local.remove(['authToken', 'authUser']);
      }
      return;
    }

    const token = cookie.value;
    if (currentStorage.authToken === token && currentStorage.authUser) {
      return;
    }

    const response = await fetch(apiUrl('/auth/profile'), {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.ok) {
      const body: unknown = await response.json();
      const user = unwrapApi<Record<string, unknown>>(body);
      await chrome.storage.local.set({
        authToken: token,
        authUser: user,
      });
    } else if (response.status === 401) {
      await chrome.storage.local.remove(['authToken', 'authUser']);
    }
  } catch (err) {
    console.error('Failed to sync auth cookie:', err);
  }
}

export async function clearExtensionAuthAndCookie(): Promise<void> {
  await chrome.storage.local.remove(['authToken', 'authUser']);
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
