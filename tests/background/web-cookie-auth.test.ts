import { describe, expect, it } from 'vitest';
import { shouldIgnoreCookieChange } from '../../src/lib/authCookie';

describe('shouldIgnoreCookieChange', () => {
  it('ignores overwrite removals (cookie update flicker)', () => {
    expect(shouldIgnoreCookieChange({ removed: true, cause: 'overwrite' })).toBe(true);
  });

  it('does not ignore real removals', () => {
    expect(shouldIgnoreCookieChange({ removed: true, cause: 'explicit' })).toBe(false);
    expect(shouldIgnoreCookieChange({ removed: true, cause: 'expired' })).toBe(false);
  });

  it('does not ignore sets', () => {
    expect(shouldIgnoreCookieChange({ removed: false, cause: 'explicit' })).toBe(false);
  });
});
