import { describe, expect, it } from 'vitest';
import {
  dailyCreditsRemaining,
  hasUnlimitedCredits,
  isUserFreeTier,
  licenseStatusOf,
} from '@/lib/entitlements/license';

describe('license helpers', () => {
  it('treats FREE as free tier with metered credits', () => {
    const user = {
      entitlements: {
        licenseStatus: 'FREE' as const,
        dailyCreditsRemaining: 9,
        unlimitedCredits: false,
      },
    };
    expect(licenseStatusOf(user)).toBe('FREE');
    expect(isUserFreeTier(user)).toBe(true);
    expect(hasUnlimitedCredits(user)).toBe(false);
    expect(dailyCreditsRemaining(user)).toBe(9);
  });

  it('treats PRO as unlimited', () => {
    const user = {
      entitlements: {
        licenseStatus: 'PRO' as const,
        unlimitedCredits: true,
        dailyCreditsRemaining: 15,
      },
    };
    expect(isUserFreeTier(user)).toBe(false);
    expect(hasUnlimitedCredits(user)).toBe(true);
  });

  it('returns 0 daily credits for null or anonymous user', () => {
    expect(dailyCreditsRemaining(null)).toBe(0);
    expect(dailyCreditsRemaining(undefined)).toBe(0);
  });
});
