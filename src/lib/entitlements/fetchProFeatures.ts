import { defaultProFeatures, type ProFeaturesMap } from './proFeatures';

/**
 * Loads pro feature entitlement map.
 * Since Shotuno is 100% free and open-source, all tools default to unlocked with zero network calls.
 */
export async function loadProFeatures(_force = false): Promise<ProFeaturesMap> {
  return defaultProFeatures();
}
