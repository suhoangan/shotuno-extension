import { describe, expect, it } from 'vitest';

/** Pure helper mirroring background AUTH message handling */
export function reduceAuthMessage(
  message: { type: string; token?: string; user?: unknown },
  state: { token: string | null; user: unknown },
) {
  if (message.type === 'AUTH_LOGIN' && message.token && message.user) {
    return { token: message.token, user: message.user };
  }
  if (message.type === 'AUTH_LOGOUT') {
    return { token: null, user: null };
  }
  if (message.type === 'AUTH_GET') {
    return state;
  }
  return state;
}

describe('auth sync message reducer', () => {
  it('applies login', () => {
    const next = reduceAuthMessage(
      { type: 'AUTH_LOGIN', token: 'abc', user: { email: 'a@b.com' } },
      { token: null, user: null },
    );
    expect(next.token).toBe('abc');
  });

  it('clears on logout', () => {
    const next = reduceAuthMessage(
      { type: 'AUTH_LOGOUT' },
      { token: 'abc', user: { email: 'a@b.com' } },
    );
    expect(next).toEqual({ token: null, user: null });
  });
});

