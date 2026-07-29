import { useCallback, useState } from 'react';
import {
  requireProAccess,
  type ProFeatureId,
} from '../../../lib/entitlements/requirePro';
import { ProPaywall } from '../ProPaywall';

/** Hook: gate a Pro action and show paywall when blocked. */
export function useProGate() {
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [needAuth, setNeedAuth] = useState(false);

  const runPro = useCallback(async (featureId: ProFeatureId, action: () => void | Promise<void>) => {
    const result = await requireProAccess(featureId);
    if (!result.ok) {
      setNeedAuth(result.reason === 'auth');
      setPaywallOpen(true);
      return false;
    }
    await action();
    return true;
  }, []);

  const paywall = (
    <ProPaywall
      open={paywallOpen}
      onOpenChange={setPaywallOpen}
      needAuth={needAuth}
    />
  );

  return { runPro, paywall };
}
