import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/entitlements/unlock', () => ({ isProFeaturesUnlocked: vi.fn(() => false) }));

import { isProFeaturesUnlocked } from '@/lib/entitlements/unlock';
import { resolveCanUsePro, resolveIsPro, type PublicUser } from '@/lib/entitlements/policy';

function user(partial: Partial<PublicUser>): PublicUser {
  return {
    id: '1',
    email: 'a@b.com',
    name: null,
    role: 'USER',
    trialEndsAt: null,
    ...partial,
  };
}

beforeEach(() => {
  vi.mocked(isProFeaturesUnlocked).mockReturnValue(false);
});

describe('resolveCanUsePro', () => {
  it('denies guests', () => {
    expect(resolveCanUsePro(null)).toBe(false);
    expect(resolveCanUsePro(undefined)).toBe(false);
  });

  it('allows admins', () => {
    expect(resolveCanUsePro(user({ role: 'ADMIN' }))).toBe(true);
  });

  it('allows everyone when pro unlock flag is on', () => {
    vi.mocked(isProFeaturesUnlocked).mockReturnValue(true);
    expect(resolveCanUsePro(null)).toBe(true);
  });

  it('uses entitlements.canUsePro when present', () => {
    expect(
      resolveCanUsePro(
        user({
          entitlements: {
            planTier: 'free',
            status: 'active',
            isPro: false,
            proCreditsRemaining: 0,
            currentPeriodEnd: null,
            canUsePro: true,
          },
        }),
      ),
    ).toBe(true);
  });

  it('falls back to active trial date', () => {
    expect(resolveCanUsePro(user({ proCreditsRemaining: 2 }))).toBe(false);
    expect(
      resolveCanUsePro(
        user({ trialEndsAt: new Date(Date.now() + 60_000).toISOString() }),
      ),
    ).toBe(true);
    expect(
      resolveCanUsePro(
        user({ trialEndsAt: new Date(Date.now() - 60_000).toISOString() }),
      ),
    ).toBe(false);
  });
});

describe('resolveIsPro', () => {
  it('is true for admin or entitlements.isPro', () => {
    expect(resolveIsPro(user({ role: 'ADMIN' }))).toBe(true);
    expect(
      resolveIsPro(
        user({
          entitlements: {
            planTier: 'pro',
            status: 'active',
            isPro: true,
            proCreditsRemaining: 0,
            currentPeriodEnd: null,
            canUsePro: true,
          },
        }),
      ),
    ).toBe(true);
    expect(resolveIsPro(user({}))).toBe(false);
  });
});

