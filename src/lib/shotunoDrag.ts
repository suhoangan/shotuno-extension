/** Shared drag payload so side panel → editor (and SaaS) drops stay consistent. */
export const SHOTUNO_DRAG_MIME = 'application/x-shotuno-library';

export type ShotunoDragPayload = {
  kind: 'gallery' | 'pin';
  ids: string[];
};

export function setShotunoDragData(
  dt: DataTransfer,
  payload: ShotunoDragPayload,
) {
  dt.effectAllowed = 'copyMove';
  dt.setData(SHOTUNO_DRAG_MIME, JSON.stringify(payload));
  // text/plain keeps a typed fallback for contexts that strip custom MIME types
  dt.setData('text/plain', payload.ids.map((id) => `shotuno:${payload.kind}:${id}`).join(','));
}

export function parseShotunoDragIds(raw: string | undefined | null): ShotunoDragPayload | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ShotunoDragPayload;
    if ((parsed.kind === 'gallery' || parsed.kind === 'pin') && Array.isArray(parsed.ids) && parsed.ids.length) {
      return parsed;
    }
  } catch {
    /* not JSON — try prefixed plain text */
  }

  const ids: string[] = [];
  let kind: 'gallery' | 'pin' | null = null;
  for (const part of raw.split(',').map((s) => s.trim()).filter(Boolean)) {
    const pin = /^shotuno:pin:(.+)$/.exec(part);
    const gallery = /^shotuno:gallery:(.+)$/.exec(part);
    if (pin) {
      kind = 'pin';
      ids.push(pin[1]);
    } else if (gallery) {
      kind = 'gallery';
      ids.push(gallery[1]);
    } else if (/^[\w-]+$/.test(part)) {
      // legacy bare ids from older gallery canvas DnD
      ids.push(part);
      kind = kind ?? 'gallery';
    }
  }
  if (!kind || !ids.length) return null;
  return { kind, ids };
}

export function fetchLibraryDataUrl(kind: 'gallery' | 'pin', id: string): Promise<string | null> {
  const type = kind === 'pin' ? 'GET_PIN_FULL' : 'GET_FULL_IMAGE';
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.runtime?.sendMessage) {
      resolve(null);
      return;
    }
    chrome.runtime.sendMessage({ type, payload: { id } }, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null);
        return;
      }
      resolve((response as { dataUrl?: string } | undefined)?.dataUrl || null);
    });
  });
}
