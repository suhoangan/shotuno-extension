import { useState, useEffect, useCallback } from 'react';
import {
  isProFeatureEnabled,
  type ProFeaturesMap,
} from '../../../../lib/entitlements/proFeatures';
import { loadProFeatures } from '../../../../lib/entitlements/fetchProFeatures';

export function useToolbarEntitlements() {
  const [proFeatures, setProFeatures] = useState<ProFeaturesMap | null>(null);

  useEffect(() => {
    void loadProFeatures().then(setProFeatures);
  }, []);

  const featureEnabled = useCallback(
    (featureId: string) =>
      !proFeatures || isProFeatureEnabled(proFeatures, featureId),
    [proFeatures],
  );

  return {
    featureEnabled,
    proFeatures,
  };
}
