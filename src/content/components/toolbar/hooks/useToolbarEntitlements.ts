import { useState, useEffect, useCallback } from 'react';
import {
  isProFeatureEnabled,
  type ProFeaturesMap,
} from '../../../../lib/entitlements/proFeatures';
import { isUserFreeTier as computeFreeTier } from '../../../../lib/entitlements/license';
import { loadProFeatures } from '../../../../lib/entitlements/fetchProFeatures';
import { storage } from '../../../../lib/chromeStorage';

export function useToolbarEntitlements() {
  const [isUserFreeTier, setIsUserFreeTier] = useState(true);
  const [proFeatures, setProFeatures] = useState<ProFeaturesMap | null>(null);

  useEffect(() => {
    const refresh = () => {
      storage.local.get('authUser').then(({ authUser }) => {
        setIsUserFreeTier(computeFreeTier(authUser as object));
      });
    };
    refresh();
    void loadProFeatures().then(setProFeatures);
    
    const onChange = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: string,
    ) => {
      if (area === 'local' && (changes.authUser || changes.authToken || changes.pro_license_status)) {
        refresh();
      }
    };
    storage.onChanged.addListener(onChange);
    return () => storage.onChanged.removeListener(onChange);
  }, []);

  useEffect(() => {
    if (!isUserFreeTier) {
      import('../../../../store/useEditorStore').then(({ useEditorStore }) => {
        useEditorStore.getState().setShowUpgradeModal(false);
      });
      import('../../../../store/useUIStore').then(({ useUIStore }) => {
        useUIStore.getState().setShowSubscriptionPopup(false);
      });
    }
  }, [isUserFreeTier]);


  const featureEnabled = useCallback(
    (featureId: string) =>
      !proFeatures || isProFeatureEnabled(proFeatures, featureId),
    [proFeatures],
  );

  return {
    isUserFreeTier,
    featureEnabled,
    proFeatures,
  };
}
