import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncAuthFromCookies, clearExtensionAuthAndCookie } from '@/background/auth-sync';
import { storage } from '@/lib/chromeStorage';
import { apiClient } from '@/lib/api';

describe('Admin & Entitlements - Credits and Auth Sync', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('syncAuthFromCookies', () => {
    it('clears storage if no cookie is present but storage has stale authToken', async () => {
      vi.stubGlobal('chrome', {
        cookies: {
          get: vi.fn().mockResolvedValue(null),
        },
      });

      const getSpy = vi.spyOn(storage.local, 'get').mockResolvedValue({
        authToken: 'stale-token',
        authUser: { id: 'user-1' },
      });
      const removeSpy = vi.spyOn(storage.local, 'remove').mockResolvedValue();

      await syncAuthFromCookies();

      expect(getSpy).toHaveBeenCalled();
      expect(removeSpy).toHaveBeenCalledWith(['authToken', 'authUser']);
    });

    it('fetches profile and sets authToken and authUser when valid cookie is found', async () => {
      const mockToken = 'valid-jwt-token-123';
      const mockProfile = {
        id: 'user-100',
        email: 'user@shotuno.com',
        entitlements: { dailyCreditsRemaining: 15, licenseStatus: 'FREE' },
      };

      vi.stubGlobal('chrome', {
        cookies: {
          get: vi.fn().mockResolvedValue({ value: encodeURIComponent(mockToken) }),
        },
      });

      vi.spyOn(storage.local, 'get').mockResolvedValue({});
      const setSpy = vi.spyOn(storage.local, 'set').mockResolvedValue();
      vi.spyOn(apiClient, 'get').mockResolvedValue(mockProfile);

      await syncAuthFromCookies();

      expect(apiClient.get).toHaveBeenCalledWith('/auth/profile', {
        headers: { Authorization: `Bearer ${mockToken}` },
      });
      expect(setSpy).toHaveBeenCalledWith({
        authToken: mockToken,
        authUser: mockProfile,
      });
    });

    it('clears credentials if profile request returns 401 unauthorized', async () => {
      const mockToken = 'expired-token';
      vi.stubGlobal('chrome', {
        cookies: {
          get: vi.fn().mockResolvedValue({ value: mockToken }),
        },
      });

      vi.spyOn(storage.local, 'get').mockResolvedValue({});
      const removeSpy = vi.spyOn(storage.local, 'remove').mockResolvedValue();
      vi.spyOn(apiClient, 'get').mockRejectedValue({ response: { status: 401 } });

      await syncAuthFromCookies();

      expect(removeSpy).toHaveBeenCalledWith(['authToken', 'authUser']);
    });
  });

  describe('clearExtensionAuthAndCookie', () => {
    it('removes storage keys and removes cookie', async () => {
      const removeCookieMock = vi.fn().mockResolvedValue(null);
      vi.stubGlobal('chrome', {
        cookies: {
          remove: removeCookieMock,
        },
      });

      const removeStorageSpy = vi.spyOn(storage.local, 'remove').mockResolvedValue();

      await clearExtensionAuthAndCookie();

      expect(removeStorageSpy).toHaveBeenCalledWith(['authToken', 'authUser']);
      expect(removeCookieMock).toHaveBeenCalled();
    });
  });
});
