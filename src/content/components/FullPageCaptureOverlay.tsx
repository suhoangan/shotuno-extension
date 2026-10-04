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
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const runCapture = async () => {
      const elementsToHide: HTMLElement[] = [];
      const overlayEl = overlayRef.current || document.getElementById('full-page-capture-overlay');
      if (overlayEl) {
        elementsToHide.push(overlayEl);
      }

      try {
        const dataUrl = await captureFullPageStitch({
          onProgress: setProgress,
          isCancelled: () => cancelledRef.current,
          elementsToHide,
        });

        if (!cancelledRef.current) {
          onCapture(dataUrl);
        }
      } catch (err) {
        console.error('Full page capture failed:', err);
        if (!cancelledRef.current) {
          onCapture(null);
        }
      }
    };

    void runCapture();

    return () => {
      cancelledRef.current = true;
    };
  }, [onCapture]);

  const handleCancel = () => {
    cancelledRef.current = true;
    onCapture(null);
  };

  return (
    <div ref={overlayRef}>
      <HardLoadingOverlay
        overlayId="full-page-capture-overlay"
        title="Capturing Full Page"
        message="Please do not interact with the page…"
        progress={progress}
        onCancel={handleCancel}
      />
    </div>
  );
}

