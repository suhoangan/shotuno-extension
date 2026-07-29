import { WEB_BASE } from '../lib/api';
import { fetchProfileEntitlements } from '../lib/entitlements/client';
import type { PublicUser } from '../lib/entitlements/policy';
import {
  AUTH_TOKEN_KEY,
  AUTH_USER_KEY,
  SHOTUNO_AUTH_TOKEN_COOKIE,
  shouldIgnoreCookieChange,
} from '../lib/authCookie';

function webUrlForCookies(): string {
  return `${WEB_BASE.replace(/\/$/, '')}/`;
}

function webOrigin(): string {
  try {
    return new URL(WEB_BASE).origin;
  } catch {
    return WEB_BASE.replace(/\/$/, '');
  }
}

function cookieBelongsToWeb(cookie: chrome.cookies.Cookie): boolean {
  const host = cookie.domain.replace(/^\./, '');
  try {
    const webHost = new URL(WEB_BASE).hostname;
    return host === webHost || webHost.endsWith(`.${host}`) || host.endsWith(`.${webHost}`);
  } catch {
    return false;
  }
}

function decodeCookieValue(raw: string | undefined): string | null {
  const trimmed = raw?.trim();
  if (!trimmed) return null;
  try {
    return decodeURIComponent(trimmed) || null;
  } catch {
    return trimmed;
  }
}

/** Prefer chrome.cookies.get; fall back to getAll (domain quirks on localhost). */
async function readWebTokenCookie(): Promise<string | null> {
  const byUrl = await chrome.cookies.get({
    url: webUrlForCookies(),
    name: SHOTUNO_AUTH_TOKEN_COOKIE,
  });
  const fromUrl = decodeCookieValue(byUrl?.value);
  if (fromUrl) return fromUrl;

  try {
    const host = new URL(WEB_BASE).hostname;
    const all = await chrome.cookies.getAll({
      name: SHOTUNO_AUTH_TOKEN_COOKIE,
      domain: host,
    });
    for (const cookie of all) {
      const value = decodeCookieValue(cookie.value);
      if (value) return value;
    }
  } catch {
    /* ignore */
  }
  return null;
}

type WebTabSession = { token: string | null; user: PublicUser | null };

/** Fallback when cookie is missing — read localStorage from open Shotuno tabs. */
async function readSessionFromWebTabs(): Promise<WebTabSession> {
  const origin = webOrigin();
  const tabs = await chrome.tabs.query({ url: [`${origin}/*`] });
  for (const tab of tabs) {
    if (tab.id == null) continue;
    try {
      const injected = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const token = localStorage.getItem('shotuno_token');
          const raw = localStorage.getItem('shotuno_user');
          let user: PublicUser | null = null;
          if (raw) {
            try {
              user = JSON.parse(raw) as PublicUser;
            } catch {
              user = null;
            }
          }
          return { token, user };
        },
      });
      const result = injected[0]?.result as WebTabSession | undefined;
      if (result?.token) {
        return { token: result.token, user: result.user ?? null };
      }
    } catch {
      /* tab may be restricted */
    }
  }
  return { token: null, user: null };
}

async function writeSession(token: string | null, user: unknown | null) {
  if (token && user) {
    await chrome.storage.local.set({ [AUTH_TOKEN_KEY]: token, [AUTH_USER_KEY]: user });
  } else {
    await chrome.storage.local.remove([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
  }
}

async function clearWebLocalSessionOnTabs() {
  const origin = webOrigin();
  const tabs = await chrome.tabs.query({ url: [`${origin}/*`] });
  await Promise.all(
    tabs.map(async (tab) => {
      if (tab.id == null) return;
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            localStorage.removeItem('shotuno_token');
            localStorage.removeItem('shotuno_user');
            window.dispatchEvent(new Event('shotuno-auth-changed'));
          },
        });
      } catch {
        /* tab may be restricted */
      }
    }),
  );
}

export async function clearWebAuthCookie() {
  await chrome.cookies.remove({
    url: webUrlForCookies(),
    name: SHOTUNO_AUTH_TOKEN_COOKIE,
  });
  await clearWebLocalSessionOnTabs();
}

let syncChain: Promise<unknown> = Promise.resolve();

function enqueueSync<T>(fn: () => Promise<T>): Promise<T> {
  const next = syncChain.then(fn, fn);
  syncChain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

function minimalUserFromJwt(token: string): PublicUser | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(json) as { sub?: string; email?: string; role?: string };
    if (!payload.sub || !payload.email) return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: null,
      role: payload.role || 'USER',
      trialEndsAt: null,
    };
  } catch {
    return null;
  }
}

async function applyWebToken(
  token: string | null,
  tabUser?: PublicUser | null,
): Promise<{ token: string | null; user: unknown | null }> {
  if (!token) {
    await writeSession(null, null);
    return { token: null, user: null };
  }

  const existing = await chrome.storage.local.get([AUTH_TOKEN_KEY, AUTH_USER_KEY]);
  if (existing[AUTH_TOKEN_KEY] === token && existing[AUTH_USER_KEY]) {
    return { token, user: existing[AUTH_USER_KEY] };
  }

  try {
    const user = await fetchProfileEntitlements(token);
    await writeSession(token, user);
    return { token, user };
  } catch {
    const fallback = tabUser || minimalUserFromJwt(token) || existing[AUTH_USER_KEY] || null;
    if (fallback) {
      await writeSession(token, fallback);
      return { token, user: fallback };
    }
    return { token: null, user: null };
  }
}

/** Cold start + AUTH_SYNC_FROM_WEB: cookie first, then open web tabs. */
export function syncSessionFromWebCookie(): Promise<{
  token: string | null;
  user: unknown | null;
}> {
  return enqueueSync(async () => {
    let token = await readWebTokenCookie();
    let tabUser: PublicUser | null = null;

    if (!token) {
      const fromTab = await readSessionFromWebTabs();
      token = fromTab.token;
      tabUser = fromTab.user;
    }

    return applyWebToken(token, tabUser);
  });
}

export function bindWebCookieAuth() {
  void syncSessionFromWebCookie();

  chrome.cookies.onChanged.addListener((changeInfo) => {
    if (changeInfo.cookie.name !== SHOTUNO_AUTH_TOKEN_COOKIE) return;
    if (!cookieBelongsToWeb(changeInfo.cookie)) return;
    if (shouldIgnoreCookieChange(changeInfo)) return;

    if (changeInfo.removed) {
      void enqueueSync(() => applyWebToken(null));
      return;
    }

    const token = decodeCookieValue(changeInfo.cookie.value);
    void enqueueSync(() => applyWebToken(token));
  });
}
