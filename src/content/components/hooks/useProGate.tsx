import { useCallback } from 'react';
import type { ProFeatureId } from '../../../lib/entitlements/proFeatures';

/** Always run — all tools are free with no remote gate. */
export function useProGate() {
  const runPro = useCallback(
    async (_featureId: ProFeatureId, action: () => void | Promise<void>) => {
      await action();
      return true;
    },
    [],
  );

  return { runPro };
}
