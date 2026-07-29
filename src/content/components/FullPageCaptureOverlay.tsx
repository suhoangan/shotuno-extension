import { useEffect, useState, useRef } from 'react';

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

    const captureFullPage = async () => {
      const originalScrollY = window.scrollY;
      const originalOverflow = document.body.style.overflow;

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

      while (currentY < totalHeight) {
        if (isCancelled) break;

        window.scrollTo(0, currentY);
        await new Promise((r) => setTimeout(r, 200));
        await yieldToBrowser();

        if (overlayRef.current) overlayRef.current.style.visibility = 'hidden';
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

        if (overlayRef.current) overlayRef.current.style.visibility = 'visible';

        if (response?.dataUrl && ctx) {
          const img = new Image();
          await new Promise<void>((res, rej) => {
            img.onload = () => res();
            img.onerror = () => rej(new Error('slice load failed'));
            img.src = response.dataUrl!;
          }).catch(() => undefined);

          if (img.complete && img.naturalWidth > 0) {
            const actualScrollY = window.scrollY;
            ctx.drawImage(img, 0, actualScrollY * dpr, viewportWidth * dpr, viewportHeight * dpr);
          }
          img.src = '';
        }

        currentY += viewportHeight;
        setProgress(Math.min(100, Math.round((currentY / totalHeight) * 100)));
        await yieldToBrowser();
      }

      document.body.style.overflow = originalOverflow;
      window.scrollTo(0, originalScrollY);

      if (!isCancelled) {
        const dataUrl = canvas.toDataURL('image/png');
        canvas.width = 0;
        canvas.height = 0;
        onCapture(dataUrl);
      } else {
        canvas.width = 0;
        canvas.height = 0;
      }
    };

    void captureFullPage();

    return () => {
      isCancelled = true;
      document.body.style.overflow = '';
    };
  }, [onCapture]);

  return (
    <div
      ref={overlayRef}
      id="full-page-capture-overlay"
      className="fixed inset-0 z-[9999999] bg-background/80 flex flex-col items-center justify-center pointer-events-auto backdrop-blur-sm transition-opacity duration-75"
    >
      <div className="bg-card p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full border border-border">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <div className="text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">Capturing Full Page</h3>
          <p className="text-sm text-muted-foreground">Please do not interact with the page...</p>
        </div>

        <div className="w-full bg-accent rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground font-medium">{progress}%</div>

        <button
          type="button"
          onClick={() => onCapture(null)}
          className="mt-2 px-6 py-2 bg-accent hover:bg-accent hover:text-accent-foreground text-foreground rounded-lg transition-colors text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
