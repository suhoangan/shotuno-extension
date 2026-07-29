import { describe, expect, it } from 'vitest';
import { isTrialActive } from '@/lib/trial';

describe('isTrialActive', () => {
  it('allows admin always', () => {
    expect(isTrialActive(null, 'ADMIN')).toBe(true);
  });

  it('checks trial date', () => {
    expect(isTrialActive(new Date(Date.now() + 10000).toISOString())).toBe(true);
    expect(isTrialActive(new Date(Date.now() - 10000).toISOString())).toBe(false);
  });
});

