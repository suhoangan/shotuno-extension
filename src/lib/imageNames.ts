/** Shared naming for pins, drops, and downloads. */

export function ensureImageExt(name: string, ext = 'png'): string {
  const trimmed = name.trim() || 'image';
  if (/\.(png|jpe?g|gif|webp|avif)$/i.test(trimmed)) return trimmed;
  return `${trimmed}.${ext}`;
}

/** Strip path junk / query noise into a short base name. */
export function sanitizeBaseName(raw: string, fallback = 'image'): string {
  const cleaned = raw
    .replace(/\.[a-z0-9]+$/i, '')
    .split('')
    .map((ch) => (/[<>:"/\\|?*]/.test(ch) || ch.charCodeAt(0) < 32 ? ' ' : ch))
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);
  return cleaned || fallback;
}

/** e.g. Shotuno Pin 2026-07-26 22-34-01-042.png */
export function stampedImageName(kind: 'pin' | 'drop' | 'shot', ext = 'png'): string {
  const label = kind === 'pin' ? 'Pin' : kind === 'drop' ? 'Drop' : 'Shot';
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 8).replace(/:/g, '-');
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `Shotuno ${label} ${date} ${time}-${ms}.${ext}`;
}

export function filenameFromUrl(url: string, kind: 'pin' | 'drop' = 'drop'): string {
  try {
    const path = new URL(url).pathname.split('/').pop() || '';
    const base = sanitizeBaseName(decodeURIComponent(path), '');
    if (base && base.length >= 3) return ensureImageExt(base);
  } catch {
    /* ignore */
  }
  return stampedImageName(kind);
}
