import { useEffect, useState, useRef } from 'react';
import { hideFloatingElements, listFloatingElements } from './fullPageFloatingChrome';
import { HardLoadingOverlay } from './HardLoadingOverlay';

function yieldToBrowser() {
  return new Promise<void>((resolve) => {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(() => resolve(), { timeout: 100 });
    } else {
      requestAnimationFrame(() => resolve());
    }
  });
}

export default function FullPageCaptureOverlay({
  onCapture,
}: {
  onCapture: (dataUrl: string | null) => void;
}) {
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;
    let restoreFloating: (() => void) | null = null;

    const captureFullPage = async () => {
      const originalScrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;

      try {
        document.body.style.overflow = 'hidden';
        window.scrollTo(0, 0);
        await new Promise((r) => setTimeout(r, 500));

        const totalHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight,
        );

        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        const dpr = window.devicePixelRatio || 1;

        const canvas = document.createElement('canvas');
        canvas.width = viewportWidth * dpr;
        canvas.height = totalHeight * dpr;
        const ctx = canvas.getContext('2d');

        let currentY = 0;
        let sliceIndex = 0;

        while (currentY < totalHeight) {
          if (isCancelled) break;

          window.scrollTo(0, currentY);
          await new Promise((r) => setTimeout(r, 200));
          await yieldToBrowser();

          if (sliceIndex > 0) {
            restoreFloating?.();
            restoreFloating = hideFloatingElements(listFloatingElements());
            await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
          }

          // Hide the loading card before each slice so it is not stamped into the PNG.
          const overlayEl =
            document.getElementById('full-page-capture-overlay') ?? overlayRef.current;
          if (overlayEl) {
            overlayEl.style.setProperty('visibility', 'hidden', 'important');
            overlayEl.style.setProperty('opacity', '0', 'important');
          }
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

          if (overlayEl) {
            overlayEl.style.removeProperty('visibility');
            overlayEl.style.removeProperty('opacity');
          }

          if (response?.dataUrl && ctx) {
            const img = new Image();
            await new Promise<void>((res, rej) => {
              img.onload = () => res();
              img.onerror = () => rej(new Error('slice load failed'));
              img.src = response.dataUrl!;
            }).catch(() => undefined);

            if (img.complete && img.naturalWidth > 0) {
              const actualScrollY = window.scrollY;
              const drawHeight = Math.min(
                viewportHeight * dpr,
                canvas.height - actualScrollY * dpr,
              );
              if (drawHeight > 0) {
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
          setProgress(Math.min(100, Math.round((currentY / totalHeight) * 100)));
          await yieldToBrowser();
        }

        if (!isCancelled) {
          const dataUrl = canvas.toDataURL('image/png');
          canvas.width = 0;
          canvas.height = 0;
          onCapture(dataUrl);
        } else {
          canvas.width = 0;
          canvas.height = 0;
        }
      } finally {
        restoreFloating?.();
        restoreFloating = null;
        document.body.style.overflow = originalOverflow;
        window.scrollTo(0, originalScrollY);
      }
    };

    void captureFullPage();

    return () => {
      isCancelled = true;
      restoreFloating?.();
      document.body.style.overflow = '';
    };
  }, [onCapture]);

  return (
    <div ref={overlayRef}>
      <HardLoadingOverlay
        overlayId="full-page-capture-overlay"
        title="Capturing Full Page"
        message="Please do not interact with the page…"
        progress={progress}
        onCancel={() => onCapture(null)}
      />
    </div>
  );
}
