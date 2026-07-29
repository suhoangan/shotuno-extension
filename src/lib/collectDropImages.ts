import { SHOTUNO_DRAG_MIME, parseShotunoDragIds } from './shotunoDrag';

/** Cap per drop so HTML dumps don't flood fetches. */
export const MAX_IMAGES_PER_DROP = 8;

/**
 * True for gallery/pin library drags.
 * During dragover getData() is empty — use types. On drop, also read the payload.
 */
export function isShotunoLibraryDrag(dt: DataTransfer): boolean {
  const types = Array.from(dt.types || []);
  if (types.includes(SHOTUNO_DRAG_MIME)) return true;

  if (parseShotunoDragIds(dt.getData(SHOTUNO_DRAG_MIME))) return true;
  const plain = dt.getData('text/plain');
  // Only treat explicit shotuno: payloads — bare words/slugs must NOT block web drops.
  return Boolean(plain && plain.includes('shotuno:') && parseShotunoDragIds(plain));
}

function isHttpOrDataImage(url: string): boolean {
  return (
    url.startsWith('http://')
    || url.startsWith('https://')
    || url.startsWith('data:image/')
  );
}

/** Loose check for URLs from <img> tags (most page CDNs omit extensions). */
function acceptImgSrc(url: string): boolean {
  if (url.startsWith('data:image/')) return url.length > 256;
  if (!(url.startsWith('http://') || url.startsWith('https://'))) return false;
  try {
    const u = new URL(url);
    if (/\.(html?|php|aspx?|json|js|css)(\?|$)/i.test(u.pathname)) return false;
    return true;
  } catch {
    return false;
  }
}

/** Stricter check for uri-list / plain (often the page URL, not the image). */
function acceptLooseImageUrl(url: string): boolean {
  if (url.startsWith('data:image/')) return url.length > 256;
  try {
    const u = new URL(url);
    if (/\.(png|jpe?g|gif|webp|avif|svg|bmp)(\?|$)/i.test(u.pathname)) return true;
    return /pinimg\.com|imgur\.com|twimg\.com|ggpht\.com|googleusercontent\.com|cloudinary|imgix|media\.|cdn\.|static\.|images\.|img\.|wp-content\/uploads/i.test(
      u.hostname + u.pathname,
    );
  } catch {
    return false;
  }
}

function scoreImageUrl(url: string): number {
  let score = 10;
  if (/\/originals\//i.test(url)) score += 100;
  else if (/\/(736x|564x)\//i.test(url)) score += 60;
  else if (/\/(474x|400x)\//i.test(url)) score += 35;
  else if (/\/(236x|170x|75x)\//i.test(url)) score += 5;
  if (/\.(png|jpe?g|webp)(\?|$)/i.test(url)) score += 15;
  if (url.startsWith('data:')) score -= 40;
  return score;
}

function normalizeImageKey(url: string): string {
  try {
    const u = new URL(url);
    u.hash = '';
    u.search = '';
    u.pathname = u.pathname
      .replace(/\/originals\//i, '/')
      .replace(/\/\d+x\d*\//i, '/');
    return `${u.origin}${u.pathname}`;
  } catch {
    return url;
  }
}

function pushScored(
  scored: Map<string, { url: string; score: number }>,
  raw: string | undefined | null,
  accept: (url: string) => boolean,
) {
  if (!raw) return;
  const url = raw.trim();
  if (!url || !isHttpOrDataImage(url) || !accept(url)) return;
  const key = normalizeImageKey(url);
  const score = scoreImageUrl(url);
  const prev = scored.get(key);
  if (!prev || score > prev.score) scored.set(key, { url, score });
}

/** Collect image files + http(s)/data URLs from a browser drop (web page or desktop). */
export function collectDropImages(dt: DataTransfer): { files: File[]; urls: string[] } {
  if (isShotunoLibraryDrag(dt)) return { files: [], urls: [] };

  const files = Array.from(dt.files || []).filter((f) => f.type.startsWith('image/'));
  if (files.length) {
    return { files: files.slice(0, MAX_IMAGES_PER_DROP), urls: [] };
  }

  const scored = new Map<string, { url: string; score: number }>();

  const uriList = dt.getData('text/uri-list');
  if (uriList) {
    for (const line of uriList.split('\n')) {
      if (line.startsWith('#')) continue;
      pushScored(scored, line, acceptLooseImageUrl);
    }
  }

  const plain = dt.getData('text/plain');
  if (plain?.startsWith('http') || plain?.startsWith('data:image/')) {
    pushScored(scored, plain, acceptLooseImageUrl);
  }

  const html = dt.getData('text/html');
  if (html) {
    for (const match of html.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
      pushScored(scored, match[1], acceptImgSrc);
    }
    for (const match of html.matchAll(/srcset=["']([^"']+)["']/gi)) {
      // "url 1x, url2 2x" — take each URL token
      for (const part of match[1].split(',')) {
        const src = part.trim().split(/\s+/)[0];
        pushScored(scored, src, acceptImgSrc);
      }
    }
  }

  const urls = [...scored.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_IMAGES_PER_DROP)
    .map((x) => x.url);

  return { files: [], urls };
}

export function dropHasImages(dt: DataTransfer): boolean {
  if (isShotunoLibraryDrag(dt)) return false;
  const types = Array.from(dt.types || []);
  if (Array.from(dt.files || []).some((f) => f.type.startsWith('image/'))) return true;
  // During dragover, getData is often empty — rely on types only.
  return types.includes('Files') || types.includes('text/uri-list') || types.includes('text/html');
}
