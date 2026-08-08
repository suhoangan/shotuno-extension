import { hideFloatingElements, listFloatingElements } from '../../components/fullPageFloatingChrome';

function yieldToBrowser() {
  return new Promise<void>((resolve) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => resolve(), { timeout: 100 });
    } else {
      requestAnimationFrame(() => resolve());
    }
  });
}

const MAX_CANVAS_HEIGHT = 16384;

export interface FullPageStitchOptions {
  onProgress?: (percent: number) => void;
  isCancelled?: () => boolean;
  /** Elements to temporarily hide during the stitch (e.g. overlays) */
  elementsToHide?: HTMLElement[];
}

/**
 * Reusable full page capture stitch logic.
 * Scrolls through the page and captures visible tabs, stitching them together.
 */
export async function captureFullPageStitch(opts: FullPageStitchOptions = {}): Promise<string | null> {
  const originalScrollY = window.scrollY;
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    ::-webkit-scrollbar { display: none !important; }
    html, body { scroll-behavior: auto !important; }
  `;
  let restoreFloating: (() => void) | null = null;

  try {
    document.head.appendChild(styleEl);
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 500));

    const totalHeightRaw = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
    );

    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dpr = window.devicePixelRatio || 1;

    let totalHeight = totalHeightRaw;
    if (totalHeight * dpr > MAX_CANVAS_HEIGHT) {
      console.warn(`Page height ${totalHeight * dpr}px exceeds max canvas height ${MAX_CANVAS_HEIGHT}px. Capturing up to the limit.`);
      totalHeight = Math.floor(MAX_CANVAS_HEIGHT / dpr);
    }

    const canvas = document.createElement('canvas');
    canvas.width = viewportWidth * dpr;
    canvas.height = totalHeight * dpr;
    const ctx = canvas.getContext('2d');

    let currentY = 0;
    let sliceIndex = 0;

    while (currentY < totalHeight) {
      if (opts.isCancelled?.()) break;

      window.scrollTo({ top: currentY, left: 0, behavior: 'instant' });
      await new Promise((r) => setTimeout(r, 250));
      await yieldToBrowser();

      if (sliceIndex > 0) {
        restoreFloating?.();
        restoreFloating = hideFloatingElements(listFloatingElements());
        await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      }

      // Hide specific overlay elements so they don't appear in the capture
      opts.elementsToHide?.forEach(el => {
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
      });
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
      await new Promise((r) => setTimeout(r, 50));

      const response = await new Promise<{ dataUrl?: string } | undefined>((resolve) => {
        chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB' }, (res) => {
          if (chrome.runtime.lastError) {
            resolve(undefined);
            return;
          }
          resolve(res as { dataUrl?: string } | undefined);
        });
      });

      opts.elementsToHide?.forEach(el => {
        el.style.removeProperty('visibility');
        el.style.removeProperty('opacity');
      });

      if (response?.dataUrl && ctx) {
        const img = new Image();
        await new Promise<void>((res, rej) => {
          img.onload = () => res();
          img.onerror = () => rej(new Error('slice load failed'));
          img.src = response.dataUrl!;
        }).catch(() => undefined);

        if (img.complete && img.naturalWidth > 0) {
          const actualScrollY = window.scrollY;
          // If we are at the bottom, we might not have scrolled fully to currentY if there isn't enough scroll space.
          // Or if we hit the MAX_CANVAS_HEIGHT limit, actualScrollY might be larger than canvas height.
          const drawHeight = Math.min(
            viewportHeight * dpr,
            canvas.height - actualScrollY * dpr,
          );
          if (drawHeight > 0 && actualScrollY * dpr < canvas.height) {
            ctx.drawImage(
              img,
              0,
              0,
              viewportWidth * dpr,
              drawHeight,
              0,
              actualScrollY * dpr,
              viewportWidth * dpr,
              drawHeight,
            );
          }
        }
        img.src = '';
      }

      currentY += viewportHeight;
      sliceIndex += 1;
      
      const progressPercent = Math.min(100, Math.round((currentY / totalHeight) * 100));
      opts.onProgress?.(progressPercent);
      
      await yieldToBrowser();
    }

    if (!opts.isCancelled?.()) {
      const dataUrl = canvas.toDataURL('image/png');
      canvas.width = 0;
      canvas.height = 0;
      return dataUrl;
    } else {
      canvas.width = 0;
      canvas.height = 0;
      return null;
    }
  } finally {
    restoreFloating?.();
    restoreFloating = null;
    if (styleEl.parentNode) {
      styleEl.parentNode.removeChild(styleEl);
    }
    window.scrollTo(0, originalScrollY);
  }
}
