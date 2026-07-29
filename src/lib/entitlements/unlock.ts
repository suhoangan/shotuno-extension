/**
 * Local-only Pro bypass. Set in .env:
 *   VITE_UNLOCK_PRO_FEATURES=true
 * Never enable in production builds.
 */
export function isProFeaturesUnlocked(): boolean {
  const env = import.meta.env;
  if (typeof env === 'undefined') return false;
  const flag = env.VITE_UNLOCK_PRO_FEATURES;
  return flag === true || flag === 'true' || flag === '1';
}
