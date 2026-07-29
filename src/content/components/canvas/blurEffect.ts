/** Shared mosaic / gaussian patches for live canvas + export (image-pixel coords). */

export function blurPixelSize(strokeWidth: number) {
  return Math.max(2, Math.round((strokeWidth || 12) / 1.5));
}

export function blurRadiusPx(strokeWidth: number) {
  return Math.max(2, (strokeWidth || 12) / 1.5);
}

function clampRect(
  source: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
) {
  const sx = Math.max(0, Math.min(Math.floor(x), source.width));
  const sy = Math.max(0, Math.min(Math.floor(y), source.height));
  const sw = Math.max(0, Math.min(Math.ceil(w), source.width - sx));
  const sh = Math.max(0, Math.min(Math.ceil(h), source.height - sy));
  return { sx, sy, sw, sh };
}

/** Downscale → upscale mosaic of a screenshot region. */
export function createPixelatedPatch(
  source: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  pixelSize: number,
): HTMLCanvasElement | null {
  const { sx, sy, sw, sh } = clampRect(source, x, y, w, h);
  if (sw < 1 || sh < 1) return null;

  const size = Math.max(2, pixelSize);
  const tw = Math.max(1, Math.ceil(sw / size));
  const th = Math.max(1, Math.ceil(sh / size));

  const small = document.createElement('canvas');
  small.width = tw;
  small.height = th;
  const sctx = small.getContext('2d');
  if (!sctx) return null;
  sctx.imageSmoothingEnabled = false;
  sctx.drawImage(source, sx, sy, sw, sh, 0, 0, tw, th);

  const out = document.createElement('canvas');
  out.width = sw;
  out.height = sh;
  const octx = out.getContext('2d');
  if (!octx) return null;
  octx.imageSmoothingEnabled = false;
  octx.drawImage(small, 0, 0, tw, th, 0, 0, sw, sh);
  return out;
}

/** Gaussian blur of a screenshot region (padded so edges don't clip). */
export function createBlurredPatch(
  source: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
): HTMLCanvasElement | null {
  const { sx, sy, sw, sh } = clampRect(source, x, y, w, h);
  if (sw < 1 || sh < 1) return null;

  const r = Math.max(1, Math.round(radius));
  const pad = r * 2;
  const srcX = Math.max(0, sx - pad);
  const srcY = Math.max(0, sy - pad);
  const srcW = Math.min(source.width, sx + sw + pad) - srcX;
  const srcH = Math.min(source.height, sy + sh + pad) - srcY;
  const offsetX = sx - srcX;
  const offsetY = sy - srcY;

  const padded = document.createElement('canvas');
  padded.width = srcW;
  padded.height = srcH;
  const pctx = padded.getContext('2d');
  if (!pctx) return null;
  pctx.drawImage(source, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);

  const blurred = document.createElement('canvas');
  blurred.width = srcW;
  blurred.height = srcH;
  const bctx = blurred.getContext('2d');
  if (!bctx) return null;
  bctx.filter = `blur(${r}px)`;
  bctx.drawImage(padded, 0, 0);

  const out = document.createElement('canvas');
  out.width = sw;
  out.height = sh;
  const octx = out.getContext('2d');
  if (!octx) return null;
  octx.drawImage(blurred, offsetX, offsetY, sw, sh, 0, 0, sw, sh);
  return out;
}
