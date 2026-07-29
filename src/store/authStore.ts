import { create } from 'zustand';
import type { PublicUser } from '../lib/api';
import { resolveCanUsePro } from '../lib/entitlements/policy';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../lib/authCookie';

interface AuthState {
  token: string | null;
  user: PublicUser | null;
  isAuthenticated: boolean;
  login: (token: string, user: PublicUser) => void;
  logout: () => void;
  applyRemoteSession: (token: string | null, user: PublicUser | null) => void;
  hydrateFromChrome: () => void;
  checkTrialOrSubscription: () => boolean;
}

function writeChromeStorage(token: string | null, user: PublicUser | null) {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) return;
  if (token && user) {
    chrome.storage.local.set({ [AUTH_TOKEN_KEY]: token, [AUTH_USER_KEY]: user });
  } else {
    chrome.storage.local.remove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,
  isAuthenticated: false,

  login: (token, user) => {
    writeChromeStorage(token, user);
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
      chrome.runtime.sendMessage({ type: 'AUTH_LOGOUT' }, () => {
        void chrome.runtime.lastError;
      });
    }
    set({ token: null, user: null, isAuthenticated: false });
  },

  applyRemoteSession: (token, user) => {
    if (token && user) {
      set({ token, user, isAuthenticated: true });
    } else {
      set({ token: null, user: null, isAuthenticated: false });
    }
  },

  hydrateFromChrome: () => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) return;
    // Ask background to sync web cookie, then apply returned session (avoids storage race).
    chrome.runtime.sendMessage({ type: 'AUTH_SYNC_FROM_WEB' }, (res) => {
      if (chrome.runtime.lastError) {
        chrome.storage.local.get([AUTH_TOKEN_KEY, AUTH_USER_KEY], (result) => {
          const token = result[AUTH_TOKEN_KEY] as string | undefined;
          const user = result[AUTH_USER_KEY] as PublicUser | undefined;
          get().applyRemoteSession(token && user ? token : null, token && user ? user : null);
        });
        return;
      }
      const token = res?.token as string | null | undefined;
      const user = res?.user as PublicUser | null | undefined;
      get().applyRemoteSession(token && user ? token : null, token && user ? user : null);
    });
  },

  checkTrialOrSubscription: () => resolveCanUsePro(get().user),
}));

export function bindAuthStorageListener() {
  if (typeof chrome === 'undefined' || !chrome.storage?.onChanged) {
    return () => {};
  }

  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ) => {
    if (areaName !== 'local') return;
    if (!changes[AUTH_TOKEN_KEY] && !changes[AUTH_USER_KEY]) return;

    const token = changes[AUTH_TOKEN_KEY]?.newValue as string | undefined;
    const user = changes[AUTH_USER_KEY]?.newValue as PublicUser | undefined;

    if (token && user) {
      useAuthStore.getState().applyRemoteSession(token, user);
    } else if (changes[AUTH_TOKEN_KEY] && changes[AUTH_TOKEN_KEY].newValue == null) {
      useAuthStore.getState().applyRemoteSession(null, null);
    }
  };

  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
