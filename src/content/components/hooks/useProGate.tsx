import { useCallback, useState } from 'react';
import type { ProFeatureId } from '../../../lib/entitlements/proFeatures';
import { apiClient } from '../../../lib/api';
import { storage } from '../../../lib/chromeStorage';
import { useUIStore } from '../../../store/useUIStore';


type ToolUseSnapshot = {
  dailyCreditsRemaining?: number;
  unlimitedCredits?: boolean;
  licenseStatus?: string;
  canUsePro?: boolean;
  planTier?: string;
};

export function useProGate() {
  const setShowSubscriptionPopup = useUIStore((s) => s.setShowSubscriptionPopup);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const checkProAccess = useCallback(async () => {
    try {
      const data = await storage.local.get('authToken');
      const token = data.authToken as string | undefined;

      if (!token) {
        setShowSubscriptionPopup(
          true,
          'Please log in on the website to use Pro features and claim your 15 daily free credits.'
        );
        return false;
      }

      const { authUser } = await storage.local.get('authUser');
      const entitlements = (authUser as { entitlements?: ToolUseSnapshot })?.entitlements || {};
      
      if (!entitlements.unlimitedCredits && typeof entitlements.dailyCreditsRemaining === 'number' && entitlements.dailyCreditsRemaining <= 0) {
        setShowSubscriptionPopup(
          true,
          'You have run out of free credits for today. Please upgrade to Pro or wait until tomorrow.'
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error('checkProAccess error:', err);
      return false;
    }
  }, [setShowSubscriptionPopup]);

  const runPro = useCallback(
    async (featureId: ProFeatureId, action: () => void | Promise<void>) => {
      try {
        const data = await storage.local.get('authToken');
        const token = data.authToken as string | undefined;

        if (!token) {
          setShowSubscriptionPopup(
            true,
            'Please log in on the website to use Pro features and claim your 15 daily free credits.'
          );
          return false;
        }

        const resData = await apiClient.post<any, ToolUseSnapshot>('/subscriptions/tool-use', { featureId });
        if (typeof resData.dailyCreditsRemaining === 'number') {
          setCreditsRemaining(
            resData.unlimitedCredits ? null : resData.dailyCreditsRemaining,
          );
        }

        const { authUser } = await storage.local.get('authUser');
        if (authUser && typeof authUser === 'object') {
          await storage.local.set({
            authUser: {
              ...authUser,
              entitlements: {
                ...(authUser as { entitlements?: object }).entitlements,
                ...resData,
              },
            },
          });
        }

        await action();
        return true;
      } catch (err: any) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          setShowSubscriptionPopup(
            true,
            err.message ||
              'You have run out of free credits for today. Please upgrade to Pro or wait until tomorrow.'
          );
          return false;
        }
        console.error('ProGate error:', err);
        return false;
      }
    },
    [setShowSubscriptionPopup],
  );

  return {
    runPro,
    checkProAccess,
    creditsRemaining,
  };
}
