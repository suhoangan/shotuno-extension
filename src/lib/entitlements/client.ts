import { API_BASE, type PublicUser } from '../api';
import type { Entitlements } from './policy';

export type ProFeatureId =
  | 'ocr'
  | 'smart_blur'
  | 'watermark'
  | 'send_to_ai'
  | 'send_to_saas';

export type ProFeaturesMap = Record<ProFeatureId, boolean>;

const DEFAULT_PRO_FEATURES: ProFeaturesMap = {
  ocr: true,
  smart_blur: true,
  watermark: true,
  send_to_ai: true,
  send_to_saas: true,
};

/** Port-like client for entitlements API (DIP from UI). */
export async function fetchProfileEntitlements(token: string): Promise<PublicUser> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const body = await res.json();
  if (!res.ok) {
    throw new Error(body?.message || 'Failed to refresh profile');
  }
  return (body?.data ?? body) as PublicUser;
}

export async function fetchProFeatures(): Promise<ProFeaturesMap> {
  try {
    const res = await fetch(`${API_BASE}/subscriptions/pro-features`);
    if (!res.ok) return { ...DEFAULT_PRO_FEATURES };
    const body = await res.json();
    const raw = (body?.data ?? body) as Partial<ProFeaturesMap>;
    return {
      ocr: raw.ocr !== false,
      smart_blur: raw.smart_blur !== false,
      watermark: raw.watermark !== false,
      send_to_ai: raw.send_to_ai !== false,
      send_to_saas: raw.send_to_saas !== false,
    };
  } catch {
    return { ...DEFAULT_PRO_FEATURES };
  }
}

/** Analytics only — does not spend credits. */
export async function recordProToolUse(
  token: string,
  featureId: string,
): Promise<Entitlements> {
  const res = await fetch(`${API_BASE}/subscriptions/tool-use`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ featureId }),
  });
  const body = await res.json();
  if (!res.ok) {
    const err = new Error(
      body?.message || body?.data?.message || 'Pro required',
    ) as Error & { code?: string; entitlements?: Entitlements };
    err.code = body?.data?.code || body?.code || 'PRO_REQUIRED';
    err.entitlements = body?.data?.entitlements || body?.entitlements;
    throw err;
  }
  return (body?.data ?? body) as Entitlements;
}
