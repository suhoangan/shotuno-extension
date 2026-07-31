/** Longest edge kept for an imported screenshot or image, in image pixels ("2K"). */
export const MAX_IMPORT_EDGE = 2560;

export interface SizedImage {
  dataUrl: string;
  width: number;
  height: number;
}

/**
 * Size an image fits into, in image pixels.
 *
 * Width is always capped. Height is only capped for images that are not much taller than they
 * are wide, because a stitched full-page capture is legitimately thousands of pixels tall and
 * constraining its height would squeeze it into a sliver. `useCanvasZoom` treats the same
 * 2:1 ratio as "very tall" when fitting to the viewport.
 */
export function limitedDimensions(width: number, height: number, maxEdge = MAX_IMPORT_EDGE) {
  if (!(width > 0) || !(height > 0)) return { width, height, scale: 1 };

  const isVeryTall = height > width * 2;
  const scale = Math.min(1, maxEdge / width, isVeryTall ? 1 : maxEdge / height);
  if (scale >= 1) return { width, height, scale: 1 };

  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
    scale,
  };
}

function loadImage(src: string, crossOrigin?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (crossOrigin) img.crossOrigin = crossOrigin;
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

/**
 * Downscale an image so the editor never carries more pixels than it can draw.
 *
 * A 4K capture costs ~33 MB decoded plus a multi-megabyte data URL, and a dropped image keeps
 * its full-resolution source alive for as long as any undo snapshot references it — even
 * though it is drawn a few hundred pixels wide.
 *
 * Resolves with the decoded dimensions either way, so callers can lay the image out without
 * loading it a second time.
 */
export async function limitImageResolution(
  src: string,
  opts: { maxEdge?: number; crossOrigin?: string } = {},
): Promise<SizedImage> {
  const img = await loadImage(src, opts.crossOrigin);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;
  const target = limitedDimensions(width, height, opts.maxEdge);

  if (target.scale >= 1) return { dataUrl: src, width, height };

  // Only inlined sources are re-encoded. Swapping a short remote URL for a multi-megabyte
  // data URL would cost more than the smaller bitmap saves, and reading back a cross-origin
  // canvas would fail anyway.
  if (!src.startsWith('data:')) return { dataUrl: src, width, height };

  const canvas = document.createElement('canvas');
  canvas.width = target.width;
  canvas.height = target.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { dataUrl: src, width, height };

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, target.width, target.height);

  try {
    const dataUrl = canvas.toDataURL('image/png');
    return { dataUrl, width: target.width, height: target.height };
  } catch {
    return { dataUrl: src, width, height };
  } finally {
    canvas.width = 0;
    canvas.height = 0;
  }
}
