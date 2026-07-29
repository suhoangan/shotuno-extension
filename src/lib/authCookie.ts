/** Cookie on the web origin that the extension watches for login/logout. */
export const SHOTUNO_AUTH_TOKEN_COOKIE = 'shotuno_token';

export const AUTH_TOKEN_KEY = 'authToken';
export const AUTH_USER_KEY = 'authUser';

/**
 * Cookie update is remove(cause=overwrite) + set(cause=explicit).
 * Ignoring the overwrite half avoids a logout/login flicker.
 * @see https://developer.chrome.com/docs/extensions/reference/api/cookies#event-onChanged
 */
export function shouldIgnoreCookieChange(change: {
  removed: boolean;
  cause: string;
}): boolean {
  return change.removed && change.cause === 'overwrite';
}
