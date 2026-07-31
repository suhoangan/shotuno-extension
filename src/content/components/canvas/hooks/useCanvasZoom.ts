import { useEffect, useMemo, useState } from 'react';
import { getRenderScale, MAX_ZOOM, MIN_ZOOM, WHEEL_ZOOM_STEP } from '../renderScale';

export function useCanvasZoom(
  containerRef: React.RefObject<HTMLDivElement | null>, 
  image: HTMLImageElement | null, 
  bounds: { width: number, height: number }
) {
  const [scale, setScale] = useState(1);
  const [fitScale, setFitScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !image) return;

    const updateScale = () => {
      // Set initial scale to fit the image into the viewport
      const paddingTop = 120;
      const paddingBottom = 100;
      const paddingX = 40;
      const sidebarWidth = 250;
      // We always want the canvas to fit within the safe area without overlapping the toolbar or zoom controls
      const availableWidth = window.innerWidth - sidebarWidth - paddingX;
      const availableHeight = window.innerHeight - paddingTop - paddingBottom;
      
      const scaleX = availableWidth / bounds.width;
      const scaleY = availableHeight / bounds.height;
      
      // For very tall images (e.g. full page capture), we only constrain by width
      // and let the height scroll
      const isVeryTall = bounds.height > bounds.width * 2;
      const newScale = isVeryTall ? Math.min(scaleX, 1) : Math.min(scaleX, scaleY, 1);
      
      setFitScale(newScale);
      setScale(newScale);
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [image, bounds.width, bounds.height]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    let pendingFactor = 1;

    const applyZoom = () => {
      frame = 0;
      const factor = pendingFactor;
      pendingFactor = 1;
      setScale((prev) => Math.min(Math.max(MIN_ZOOM, prev * factor), MAX_ZOOM));
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // A single wheel gesture fires dozens of events and every stage resize reallocates
      // each layer's canvas, so collapse the whole gesture into one resize per frame.
      pendingFactor *= e.deltaY < 0 ? WHEEL_ZOOM_STEP : 1 / WHEEL_ZOOM_STEP;
      if (!frame) frame = requestAnimationFrame(applyZoom);
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [containerRef]);

  const renderScale = useMemo(
    () => getRenderScale(bounds.width, bounds.height, scale),
    [bounds.width, bounds.height, scale],
  );

  return { scale, setScale, fitScale, renderScale };
}
