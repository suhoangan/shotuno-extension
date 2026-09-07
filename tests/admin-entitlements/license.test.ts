import { describe, it, expect } from 'vitest';
import {
  licenseStatusOf,
  isUserFreeTier,
  hasUnlimitedCredits,
  dailyCreditsRemaining,
  AuthUserLike,
} from '@/lib/entitlements/license';

describe('Admin & Entitlements - Licensing System', () => {
  describe('licenseStatusOf resolution', () => {
    it('returns PRO when licenseStatus is explicitly PRO', () => {
      const user: AuthUserLike = { entitlements: { licenseStatus: 'PRO' } };
      const status = licenseStatusOf(user);
      expect(status).toBe('PRO');
    });

    it('returns FREE when licenseStatus is explicitly FREE', () => {
      const user: AuthUserLike = { entitlements: { licenseStatus: 'FREE' } };
      const status = licenseStatusOf(user);
      expect(status).toBe('FREE');
    });

    it('falls back to PRO for users with ADMIN role when licenseStatus is unset', () => {
      const adminUser: AuthUserLike = { role: 'ADMIN', entitlements: {} };
      expect(licenseStatusOf(adminUser)).toBe('PRO');
    });

    it('falls back to PRO for paid plan tiers (e.g. PRO_MONTHLY, PRO_ANNUAL)', () => {
      const monthlyUser: AuthUserLike = { entitlements: { planTier: 'PRO_MONTHLY' } };
      const annualUser: AuthUserLike = { entitlements: { planTier: 'PRO_ANNUAL' } };
      expect(licenseStatusOf(monthlyUser)).toBe('PRO');
      expect(licenseStatusOf(annualUser)).toBe('PRO');
    });

    it('falls back to FREE for FREE plan tier or unauthenticated user', () => {
      const freeUser: AuthUserLike = { entitlements: { planTier: 'FREE' } };
      expect(licenseStatusOf(freeUser)).toBe('FREE');
      expect(licenseStatusOf(null)).toBe('FREE');
      expect(licenseStatusOf(undefined)).toBe('FREE');
      expect(licenseStatusOf({})).toBe('FREE');
    });
  });

  describe('isUserFreeTier check', () => {
    it('returns true for FREE tier and false for PRO tier', () => {
      const freeUser: AuthUserLike = { entitlements: { licenseStatus: 'FREE' } };
      const proUser: AuthUserLike = { entitlements: { licenseStatus: 'PRO' } };
      expect(isUserFreeTier(freeUser)).toBe(true);
      expect(isUserFreeTier(proUser)).toBe(false);
      expect(isUserFreeTier(null)).toBe(true);
    });
  });

  describe('hasUnlimitedCredits check', () => {
    it('returns true when unlimitedCredits flag is true', () => {
      const user: AuthUserLike = { entitlements: { unlimitedCredits: true, licenseStatus: 'FREE' } };
      expect(hasUnlimitedCredits(user)).toBe(true);
    });

    it('returns true when licenseStatus is PRO', () => {
      const user: AuthUserLike = { entitlements: { licenseStatus: 'PRO' } };
      expect(hasUnlimitedCredits(user)).toBe(true);
    });

    it('returns false for standard FREE tier users', () => {
      const user: AuthUserLike = { entitlements: { licenseStatus: 'FREE', unlimitedCredits: false } };
      expect(hasUnlimitedCredits(user)).toBe(false);
      expect(hasUnlimitedCredits(null)).toBe(false);
    });
  });

  describe('dailyCreditsRemaining calculations', () => {
    it('returns 0 when user is null or undefined', () => {
      expect(dailyCreditsRemaining(null)).toBe(0);
      expect(dailyCreditsRemaining(undefined)).toBe(0);
    });

    it('returns exact finite positive credit count', () => {
      const user: AuthUserLike = { entitlements: { dailyCreditsRemaining: 7 } };
      expect(dailyCreditsRemaining(user)).toBe(7);
    });

    it('clamps negative credit numbers to 0', () => {
      const user: AuthUserLike = { entitlements: { dailyCreditsRemaining: -5 } };
      expect(dailyCreditsRemaining(user)).toBe(0);
    });

    it('defaults to 15 when dailyCreditsRemaining is undefined on valid user', () => {
      const user: AuthUserLike = { entitlements: {} };
      expect(dailyCreditsRemaining(user)).toBe(15);
    });
  });
});
