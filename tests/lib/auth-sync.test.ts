import { describe, expect, it } from 'vitest';

/** Pure helper mirroring background LOGIN_SYNC / LOGOUT_SYNC handling */
export function reduceAuthMessage(
  message: { type: string; token?: string; user?: unknown },
  state: { token: string | null; user: unknown },
) {
  if (message.type === 'LOGIN_SYNC' && message.token) {
    return { token: message.token, user: message.user ?? state.user };
  }
  if (message.type === 'LOGOUT_SYNC') {
    return { token: null, user: null };
  }
  return state;
}

describe('auth sync message reducer', () => {
  it('applies login', () => {
    const next = reduceAuthMessage(
      { type: 'LOGIN_SYNC', token: 'abc', user: { email: 'a@b.com' } },
      { token: null, user: null },
    );
    expect(next.token).toBe('abc');
  });

  it('clears on logout', () => {
    const next = reduceAuthMessage(
      { type: 'LOGOUT_SYNC' },
      { token: 'abc', user: { email: 'a@b.com' } },
    );
    expect(next).toEqual({ token: null, user: null });
  });
});
