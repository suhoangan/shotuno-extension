export function isTrialActive(trialEndsAt: string | null, role?: string): boolean {
  if (role === 'ADMIN') return true;
  if (!trialEndsAt) return false;
  return new Date(trialEndsAt) > new Date();
}

/** Prefer resolveCanUsePro from entitlements/policy — kept for older call sites. */
export { resolveCanUsePro as checkProAccess } from './entitlements/policy';
