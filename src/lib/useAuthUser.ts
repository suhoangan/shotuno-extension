import { useState, useEffect } from 'react';
import { syncAuthFromCookies, clearExtensionAuthAndCookie } from '../background/auth-sync';
import { webUrl } from './api';

export interface AuthUser {
  id?: string;
  email?: string;
  name?: string;
  avatarUrl?: string;
  entitlements?: {
    planTier?: string;
    licenseStatus?: 'PRO' | 'TRIAL' | 'FREE';
    dailyCreditsRemaining?: number;
    unlimitedCredits?: boolean;
    canUsePro?: boolean;
  };
}

export function useAuthUser() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    chrome.storage.local.get(['authUser']).then(({ authUser }) => {
      setAuthUser((authUser as AuthUser) || null);
      setLoading(false);
    });

    void syncAuthFromCookies().then(() => {
      chrome.storage.local.get(['authUser']).then(({ authUser }) => {
        setAuthUser((authUser as AuthUser) || null);
      });
    });

    const listener = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string,
    ) => {
      if (areaName === 'local' && changes.authUser) {
        setAuthUser((changes.authUser.newValue as AuthUser) || null);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, []);

  const loginViaWeb = () => {
    window.open(webUrl('/auth'), '_blank');
  };

  const logout = async () => {
    await clearExtensionAuthAndCookie();
    setAuthUser(null);
  };

  return { authUser, loading, loginViaWeb, logout };
}
