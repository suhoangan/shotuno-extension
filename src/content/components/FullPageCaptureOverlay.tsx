import { useEffect, useState, useRef } from 'react';
import { HardLoadingOverlay } from './HardLoadingOverlay';
import { captureFullPageStitch } from '../capture/utils/fullPageStitch';

export default function FullPageCaptureOverlay({
  onCapture,
}: {
  onCapture: (dataUrl: string | null) => void;
}) {
  const [progress, setProgress] = useState(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isCancelled = false;

    const runCapture = async () => {
      const elementsToHide: HTMLElement[] = [];
      const overlayEl = document.getElementById('full-page-capture-overlay') ?? overlayRef.current;
      if (overlayEl) {
        elementsToHide.push(overlayEl);
      }

      const dataUrl = await captureFullPageStitch({
        onProgress: setProgress,
        isCancelled: () => isCancelled,
        elementsToHide,
      });

      if (!isCancelled) {
        onCapture(dataUrl);
      }
    };

    void runCapture();

    return () => {
      isCancelled = true;
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

