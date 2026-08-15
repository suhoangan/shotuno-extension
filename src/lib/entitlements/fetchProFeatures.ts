import { apiClient } from '../api';
import { storage } from '../../lib/chromeStorage';

import {
  defaultProFeatures,
  normalizeProFeatures,
  type ProFeaturesMap,
} from './proFeatures';

const CACHE_KEY = 'shotunoProFeatures';
const CACHE_AT_KEY = 'shotunoProFeaturesAt';
const TTL_MS = 5 * 60 * 1000;

export async function loadProFeatures(force = false): Promise<ProFeaturesMap> {
  if (!storage.isAvailable()) {
    return defaultProFeatures();
  }

  if (!force) {
    const cached = await storage.local.get([CACHE_KEY, CACHE_AT_KEY]);
    const at = cached[CACHE_AT_KEY] as number | undefined;
    if (
      cached[CACHE_KEY] &&
      typeof at === 'number' &&
      Date.now() - at < TTL_MS
    ) {
      return normalizeProFeatures(cached[CACHE_KEY]);
    }
  }

  try {
    const data = await apiClient.get<any, { features?: unknown } | ProFeaturesMap>('/subscriptions/pro-features');
    const map = normalizeProFeatures(
      data && typeof data === 'object' && 'features' in data
        ? (data as { features: unknown }).features
        : data,
    );
    await storage.local.set({
      [CACHE_KEY]: map,
      [CACHE_AT_KEY]: Date.now(),
    });
    return map;
  } catch {
    return defaultProFeatures();
  }
}
