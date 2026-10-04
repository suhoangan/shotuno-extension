import { useState, useEffect, useRef } from 'react';

export function useScrollCapture({
  mode,
  rect,
  onClose
}: {
  mode: 'select' | 'record';
  rect: { x: number, y: number, w: number, h: number } | null;
  onClose?: () => void;
}) {
  const [frames, setFrames] = useState<{ y: number; dataUrl: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isScrollingTooFast, setIsScrollingTooFast] = useState(false);
  
  const lastScrollY = useRef(window.scrollY);
  const lastCaptureTime = useRef(0);
  const speedWarningTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureQueued = useRef(false);

  useEffect(() => {
    if (mode !== 'record' || !rect) return;
    
    let isCancelled = false;
    
    const elementsToHide = Array.from(document.querySelectorAll('*')).filter(el => {
      const style = window.getComputedStyle(el);
      return style.position === 'fixed' || style.position === 'sticky';
    }) as HTMLElement[];
    
    const originalStyles = elementsToHide.map(el => el.style.visibility);
    elementsToHide.forEach(el => el.style.visibility = 'hidden');

    const captureFrame = async () => {
      const now = Date.now();
      // Throttle captures to max 10 FPS to avoid overloading the extension port
      if (now - lastCaptureTime.current < 100) {
        if (!captureQueued.current) {
          captureQueued.current = true;
          setTimeout(() => {
            if (!isCancelled) captureFrame();
          }, 100 - (now - lastCaptureTime.current));
        }
        return;
      }
      captureQueued.current = false;
      lastCaptureTime.current = Date.now();
      
      const currentScrollY = window.scrollY;
      
      const response = await new Promise<{ dataUrl?: string } | undefined>((resolve) => {
        chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB' }, (res) => {
          resolve(res as { dataUrl?: string } | undefined);
        });
      });

      if (isCancelled || !response?.dataUrl) return;
      
      setFrames(prev => [...prev, { y: currentScrollY, dataUrl: response.dataUrl! }]);
    };
    
    // Initial frame
    void captureFrame();

    const handleScroll = () => {
      const currentY = window.scrollY;
      const delta = Math.abs(currentY - lastScrollY.current);
      
      // Speed warning if they scroll more than 90% of the box height between captures
      if (delta > rect.h * 0.9) {
        setIsScrollingTooFast(true);
        if (speedWarningTimeout.current) clearTimeout(speedWarningTimeout.current);
        speedWarningTimeout.current = setTimeout(() => setIsScrollingTooFast(false), 1000);
      }
      
      // Queue a capture if we scrolled a moderate amount
      if (delta > 50) {
        lastScrollY.current = currentY;
        void captureFrame();
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      isCancelled = true;
      window.removeEventListener('scroll', handleScroll);
      if (speedWarningTimeout.current) clearTimeout(speedWarningTimeout.current);
      
      elementsToHide.forEach((el, i) => {
        if (el) el.style.visibility = originalStyles[i];
      });
    };
  }, [mode, rect]);

  const handleStopAndStitch = async () => {
    if (!rect || frames.length === 0) {
      onClose?.();
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const dpr = window.devicePixelRatio || 1;
      const croppedFrames = await Promise.all(frames.map(async (frame) => {
        const img = new Image();
        await new Promise((res, rej) => {
          img.onload = res;
          img.onerror = rej;
          img.src = frame.dataUrl;
        });
        
        const canvas = document.createElement('canvas');
        canvas.width = rect.w * dpr;
        canvas.height = rect.h * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(
            img,
            rect.x * dpr, rect.y * dpr, rect.w * dpr, rect.h * dpr,
            0, 0, rect.w * dpr, rect.h * dpr
          );
        }
        return { y: frame.y, dataUrl: canvas.toDataURL('image/png') };
      }));
      
      croppedFrames.sort((a, b) => a.y - b.y);
      
      const totalHeightPhysical = Math.round((croppedFrames[croppedFrames.length - 1].y - croppedFrames[0].y + rect.h) * dpr);
      const canvas = document.createElement('canvas');
      canvas.width = rect.w * dpr;
      canvas.height = totalHeightPhysical;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        let currentDrawYPhysical = 0;
        let lastFrameY = croppedFrames[0].y;
        
        for (let i = 0; i < croppedFrames.length; i++) {
          const frame = croppedFrames[i];
          const img = new Image();
          await new Promise((res) => {
            img.onload = res;
            img.src = frame.dataUrl;
          });
          
          // Track Y in exact physical pixels to prevent subpixel bleeding/blur
          const yDiffPhysical = Math.round((frame.y - lastFrameY) * dpr);
          currentDrawYPhysical += yDiffPhysical;
          
          ctx.drawImage(img, 0, currentDrawYPhysical);
          lastFrameY = frame.y;
        }
      }
      
      const stitchedDataUrl = canvas.toDataURL('image/png');
      document.dispatchEvent(new CustomEvent('replace-screenshot', { detail: { dataUrl: stitchedDataUrl } }));
    } catch (e) {
      console.error(e);
      onClose?.();
    }
  };

  return {
    frames,
    isProcessing,
    isScrollingTooFast,
    handleStopAndStitch
  };
}
