/** Single source of truth for free-tier UI (crowns) vs Pro access. */

export type LicenseStatus = 'PRO' | 'FREE';

export type EntitlementsLike = {
  licenseStatus?: LicenseStatus | string;
  planTier?: string;
  dailyCreditsRemaining?: number;
  unlimitedCredits?: boolean;
  canUsePro?: boolean;
};

export type AuthUserLike = {
  entitlements?: EntitlementsLike | null;
  role?: string;
};

export function licenseStatusOf(user: AuthUserLike | null | undefined): LicenseStatus {
  const status = user?.entitlements?.licenseStatus;
  
  const statusMap: Record<string, LicenseStatus> = {
    PRO: 'PRO',
    FREE: 'FREE',
  };
  
  if (status && statusMap[status]) return statusMap[status];

  // Legacy fallback before licenseStatus existed
  if (user?.role === 'ADMIN') return 'PRO';
  const tier = user?.entitlements?.planTier;
  if (tier && tier !== 'FREE') return 'PRO';
  return 'FREE';
}

/** Crowns / upsell chrome — FREE only. */
export function isUserFreeTier(user: AuthUserLike | null | undefined): boolean {
  return licenseStatusOf(user) === 'FREE';
}

export function hasUnlimitedCredits(user: AuthUserLike | null | undefined): boolean {
  if (user?.entitlements?.unlimitedCredits === true) return true;
  return licenseStatusOf(user) === 'PRO';
}

export function dailyCreditsRemaining(user: AuthUserLike | null | undefined): number {
  if (!user) return 0;
  const n = user?.entitlements?.dailyCreditsRemaining;
  return typeof n === 'number' && Number.isFinite(n) ? Math.max(0, n) : 15;
}
