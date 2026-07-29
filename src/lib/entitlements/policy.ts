import { isProFeaturesUnlocked } from './unlock';

export type Entitlements = {
  planTier: string;
  status: string;
  isPro: boolean;
  isTrialActive?: boolean;
  trialEndsAt?: string | null;
  proToolUseCount?: number;
  /** @deprecated Always 0 — trial is date-based. */
  proCreditsRemaining: number;
  currentPeriodEnd: string | null;
  canUsePro: boolean;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  trialEndsAt: string | null;
  proCreditsRemaining?: number;
  proToolUseCount?: number;
  hasGoogleDrive?: boolean;
  googleDriveRefreshToken?: string | null;
  entitlements?: Entitlements;
};

/** Client-side mirror of API EntitlementPolicy (SRP). */
export function resolveCanUsePro(user: PublicUser | null | undefined): boolean {
  if (isProFeaturesUnlocked()) return true;
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  if (user.entitlements) return user.entitlements.canUsePro;
  if (!user.trialEndsAt) return false;
  return new Date(user.trialEndsAt) > new Date();
}

export function resolveIsPro(user: PublicUser | null | undefined): boolean {
  if (isProFeaturesUnlocked()) return true;
  if (!user) return false;
  if (user.role === 'ADMIN') return true;
  return Boolean(user.entitlements?.isPro);
}
