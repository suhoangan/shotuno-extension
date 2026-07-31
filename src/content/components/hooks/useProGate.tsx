import { useCallback, useState } from 'react';
import type { ProFeatureId } from '../../../lib/entitlements/proFeatures';
import { apiUrl, webUrl } from '../../../lib/api';

export function useProGate() {
  const [showSubscriptionPopup, setShowSubscriptionPopup] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState('');
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);

  const runPro = useCallback(
    async (featureId: ProFeatureId, action: () => void | Promise<void>) => {
      try {
        const data = await chrome.storage.local.get('authToken');
        const token = data.authToken;

        if (!token) {
          setSubscriptionMessage('Please log in on the website to use Pro features and claim your 15 daily free credits.');
          setShowSubscriptionPopup(true);
          return false;
        }

        const response = await fetch(apiUrl('/subscriptions/tool-use'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ featureId }),
        });

        if (response.status === 401 || response.status === 403) {
          const body = await response.json().catch(() => ({}));
          setSubscriptionMessage(body.message || 'You have run out of free credits for today. Please upgrade to Pro or wait until tomorrow.');
          setShowSubscriptionPopup(true);
          return false;
        }

        if (!response.ok) {
          console.error('Failed to consume credit');
          return false;
        }

        const resData = await response.json();
        if (resData.dailyCreditsRemaining !== undefined) {
          setCreditsRemaining(resData.dailyCreditsRemaining);
        }

        await action();
        return true;
      } catch (err) {
        console.error('ProGate error:', err);
        return false;
      }
    },
    [],
  );

  return { runPro, showSubscriptionPopup, setShowSubscriptionPopup, subscriptionMessage, creditsRemaining };
}
