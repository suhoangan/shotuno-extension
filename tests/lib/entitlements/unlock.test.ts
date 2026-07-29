import { describe, expect, it } from 'vitest';
import { isProFeaturesUnlocked } from '@/lib/entitlements/unlock';

describe('isProFeaturesUnlocked', () => {
  it('reads VITE_UNLOCK_PRO_FEATURES from import.meta.env', () => {
    const flag = import.meta.env.VITE_UNLOCK_PRO_FEATURES;
    const expected = flag === true || flag === 'true' || flag === '1';
    expect(isProFeaturesUnlocked()).toBe(expected);
  });
});

