import type { Entitlements, PublicUser } from './entitlements/policy';

const env = import.meta.env;

export const API_BASE =
  (typeof env !== 'undefined' && env.VITE_API_URL) || 'http://localhost:3000';

export const WEB_BASE =
  (typeof env !== 'undefined' && env.VITE_WEB_URL) || 'http://localhost:3001';

export type { Entitlements, PublicUser };

export type AuthPayload = {
  access_token: string;
  user: PublicUser;
};

export async function parseAuthResponse(res: Response): Promise<AuthPayload> {
  const body = await res.json();
  if (!res.ok) {
    const message = body?.message || body?.data?.message || 'Request failed';
    throw new Error(Array.isArray(message) ? message.join(', ') : String(message));
  }
  if (body?.data?.access_token) {
    return body.data as AuthPayload;
  }
  return body as AuthPayload;
}

export function googleAuthUrl() {
  return `${API_BASE}/auth/google`;
}

export function webUrl(path = '/') {
  const base = WEB_BASE.replace(/\/$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}
