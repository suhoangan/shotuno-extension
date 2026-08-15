export type AuthTierPreset = 'guest' | 'free_has_credits' | 'free_no_credits' | 'pro';

export type ExtensionStorageState = {
  authToken?: string | null;
  authUser?: {
    id: string;
    email: string;
    role: string;
    entitlements: {
      licenseStatus: 'FREE' | 'PRO';
      planTier: string;
      dailyCreditsRemaining: number | null;
      unlimitedCredits: boolean;
    };
  } | null;
  pro_license_status?: 'pro' | 'free';
};

export const STORAGE_PRESETS: Record<AuthTierPreset, ExtensionStorageState> = {
  guest: {
    authToken: null,
    authUser: null,
    pro_license_status: 'free',
  },
  free_has_credits: {
    authToken: 'mock-free-jwt-token-123',
    authUser: {
      id: 'usr_free_001',
      email: 'freeuser@shotuno.test',
      role: 'USER',
      entitlements: {
        licenseStatus: 'FREE',
        planTier: 'FREE',
        dailyCreditsRemaining: 15,
        unlimitedCredits: false,
      },
    },
    pro_license_status: 'free',
  },
  free_no_credits: {
    authToken: 'mock-free-jwt-token-123',
    authUser: {
      id: 'usr_free_001',
      email: 'freeuser@shotuno.test',
      role: 'USER',
      entitlements: {
        licenseStatus: 'FREE',
        planTier: 'FREE',
        dailyCreditsRemaining: 0,
        unlimitedCredits: false,
      },
    },
    pro_license_status: 'free',
  },
  pro: {
    authToken: 'mock-pro-jwt-token-456',
    authUser: {
      id: 'usr_pro_002',
      email: 'prouser@shotuno.test',
      role: 'USER',
      entitlements: {
        licenseStatus: 'PRO',
        planTier: 'PRO',
        dailyCreditsRemaining: null,
        unlimitedCredits: true,
      },
    },
    pro_license_status: 'pro',
  },
};

