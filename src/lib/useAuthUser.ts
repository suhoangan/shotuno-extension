export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  entitlements?: {
    planTier?: string;
    licenseStatus?: 'PRO' | 'FREE';
    dailyCreditsRemaining?: number;
    unlimitedCredits?: boolean;
    canUsePro?: boolean;
  };
}

/**
 * Offline-first user hook.
 * Shotuno operates 100% locally with zero required login or account setup.
 */
export function useAuthUser() {
  return {
    authUser: null,
    loading: false,
    loginViaWeb: () => {},
    logout: async () => {},
  };
}
