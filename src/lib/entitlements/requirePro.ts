import { useAuthStore } from '../../store/authStore';
import {
  fetchProfileEntitlements,
  fetchProFeatures,
  recordProToolUse,
} from './client';
import { resolveCanUsePro, type Entitlements } from './policy';
import { isProFeaturesUnlocked } from './unlock';
import { webUrl } from '../api';

export type ProFeatureId =
  | 'ocr'
  | 'smart_blur'
  | 'watermark'
  | 'send_to_ai'
  | 'send_to_saas';

/**
 * Gate a Pro tool: refresh profile → check Pro/trial date → allow unlimited use.
 * Backend only counts usage; tools run on the client.
 */
export async function requireProAccess(featureId: ProFeatureId): Promise<{
  ok: boolean;
  reason?: 'auth' | 'paywall';
  entitlements?: Entitlements;
}> {
  if (isProFeaturesUnlocked()) {
    return {
      ok: true,
      entitlements: {
        planTier: 'LIFETIME',
        status: 'ACTIVE',
        isPro: true,
        isTrialActive: false,
        trialEndsAt: null,
        proToolUseCount: 0,
        proCreditsRemaining: 0,
        currentPeriodEnd: null,
        canUsePro: true,
      },
    };
  }

  const proFeatures = await fetchProFeatures();
  if (proFeatures[featureId] === false) {
    return { ok: true };
  }

  const { token, user, login, applyRemoteSession } = useAuthStore.getState();

  if (!token || !user) {
    return { ok: false, reason: 'auth' };
  }

  try {
    const fresh = await fetchProfileEntitlements(token);
    login(token, fresh);
  } catch {
    /* use cached user */
  }

  const current = useAuthStore.getState().user;
  if (!resolveCanUsePro(current)) {
    return { ok: false, reason: 'paywall', entitlements: current?.entitlements };
  }

  try {
    const entitlements = await recordProToolUse(token, featureId);
    const nextUser = {
      ...useAuthStore.getState().user!,
      entitlements,
      proToolUseCount: entitlements.proToolUseCount,
    };
    applyRemoteSession(token, nextUser);
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ authUser: nextUser });
    }
    return { ok: true, entitlements };
  } catch (e) {
    const err = e as { entitlements?: Entitlements };
    // Access already validated locally — still allow if count failed.
    if (resolveCanUsePro(useAuthStore.getState().user)) {
      return { ok: true, entitlements: current?.entitlements };
    }
    return { ok: false, reason: 'paywall', entitlements: err.entitlements };
  }
}

export function openProPricing() {
  window.open(webUrl('/#pricing'), '_blank');
}
