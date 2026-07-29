import { useEffect, useState } from 'react';

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

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setScale(prev => {
        const scaleBy = 1.1;
        const newScale = e.deltaY < 0 ? prev * scaleBy : prev / scaleBy;
        return Math.min(Math.max(0.1, newScale), 5);
      });
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [containerRef]);

  return { scale, setScale, fitScale };
}
