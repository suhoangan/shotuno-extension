import { describe, expect, it, vi } from 'vitest';

vi.mock('@/store/authStore', () => ({
  useAuthStore: {
    getState: () => ({
      token: null,
      user: null,
      login: vi.fn(),
      applyRemoteSession: vi.fn(),
    }),
  },
}));

vi.mock('@/lib/entitlements/client', () => ({
  fetchProfileEntitlements: vi.fn(),
  recordProToolUse: vi.fn(),
  fetchProFeatures: vi.fn(async () => ({
    ocr: true,
    smart_blur: true,
    watermark: true,
    send_to_ai: true,
    send_to_saas: true,
  })),
}));

vi.mock('@/lib/entitlements/unlock', () => ({
  isProFeaturesUnlocked: vi.fn(() => false),
}));

import { isProFeaturesUnlocked } from '@/lib/entitlements/unlock';
import { fetchProFeatures } from '@/lib/entitlements/client';
import { requireProAccess, type ProFeatureId } from '@/lib/entitlements/requirePro';

const PRO_FEATURES: ProFeatureId[] = [
  'ocr',
  'smart_blur',
  'watermark',
  'send_to_ai',
  'send_to_saas',
];

describe('requireProAccess', () => {
  it('covers every Pro-gated feature id', () => {
    expect(PRO_FEATURES).toHaveLength(5);
  });

  it('returns auth when signed out', async () => {
    for (const feature of PRO_FEATURES) {
      await expect(requireProAccess(feature)).resolves.toEqual({
        ok: false,
        reason: 'auth',
      });
    }
  });

  it('allows free when admin disables Pro gate', async () => {
    vi.mocked(fetchProFeatures).mockResolvedValueOnce({
      ocr: false,
      smart_blur: true,
      watermark: true,
      send_to_ai: true,
      send_to_saas: true,
    });
    await expect(requireProAccess('ocr')).resolves.toEqual({ ok: true });
  });

  it('bypasses when unlock flag is on', async () => {
    vi.mocked(isProFeaturesUnlocked).mockReturnValue(true);
    const result = await requireProAccess('ocr');
    expect(result.ok).toBe(true);
    expect(result.entitlements?.canUsePro).toBe(true);
    vi.mocked(isProFeaturesUnlocked).mockReturnValue(false);
  });
});

