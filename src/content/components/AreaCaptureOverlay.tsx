import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { X } from 'lucide-react';

export default function AreaCaptureOverlay({ 
  onCapture,
  onClose,
}: { 
  onCapture: (rect: { x: number, y: number, w: number, h: number }) => void;
  onClose?: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [hoverRect, setHoverRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  // Use fixed positioning directly on document body to ensure it spans the whole viewport
  // because the shadow DOM container might be constrained if not careful, though we set it to 100vw/100vh.
  // Actually, returning a div here is fine since our root is fixed inset-0.

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
        else onCapture({ x: 0, y: 0, w: 0, h: 0 }); // Fallback cancel
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onCapture]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    // Do not clear hoverRect here so we can use it on mouseUp if it's a click

    setStartPos({ x: e.clientX, y: e.clientY });
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setCurrentPos({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Check if hovering over extension UI controls (Cancel button, etc)
    const shadowRoot = document.getElementById('shotuno-root')?.shadowRoot;
    if (shadowRoot) {
      const shadowElements = shadowRoot.elementsFromPoint(e.clientX, e.clientY);
      const topShadowEl = shadowElements[0];
      if (topShadowEl && topShadowEl.id !== 'capture-overlay-backdrop') {
        setHoverRect(null);
        return;
      }
    }
    
    // Auto-snapping logic
    setHoverRect(getAreaHoverRect(e.clientX, e.clientY));
  };

function getAreaHoverRect(clientX: number, clientY: number): { x: number; y: number; w: number; h: number } | null {
  const elements = document.elementsFromPoint(clientX, clientY);
  const target = elements.find((el) => el.id !== 'shotuno-root' && !el.closest('#shotuno-root'));
  if (!target || typeof target.getBoundingClientRect !== 'function') return null;
  if (target.tagName === 'HTML' || target.tagName === 'BODY') return null;

  const rect = target.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  return { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
}

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    if (w > 10 || h > 10) {
      onCapture({ x, y, w, h });
      return;
    }

    onCapture(hoverRect || { x: 0, y: 0, w: 0, h: 0 });
  };

  const x = Math.min(startPos.x, currentPos.x);
  const y = Math.min(startPos.y, currentPos.y);
  const w = Math.abs(currentPos.x - startPos.x);
  const h = Math.abs(currentPos.y - startPos.y);

  return (
    <div 
      id="capture-overlay-backdrop"
      className="fixed inset-0 z-[9999999] cursor-crosshair pointer-events-auto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="hole">
            <rect width="100%" height="100%" fill="white" />
            {isDragging && <rect x={x} y={y} width={w} height={h} fill="black" />}
            {!isDragging && hoverRect && (
              <rect 
                x={hoverRect.x} 
                y={hoverRect.y} 
                width={hoverRect.w} 
                height={hoverRect.h} 
                fill="black" 
                className="transition-all duration-150 ease-out"
              />
            )}
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#hole)" />
      </svg>
      {!isDragging && hoverRect && (
        <div 
          className="absolute border-2 border-primary border-dashed pointer-events-none transition-all duration-150 ease-out"
          style={{ left: hoverRect.x, top: hoverRect.y, width: hoverRect.w, height: hoverRect.h }}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-background/90 text-foreground border border-border text-xs px-2 py-1 rounded whitespace-nowrap">
            {Math.round(hoverRect.w)} x {Math.round(hoverRect.h)}
          </div>
        </div>
      )}
      {isDragging && (
        <div 
          className="absolute border-2 border-primary pointer-events-none"
          style={{ left: x, top: y, width: w, height: h }}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-background/90 text-foreground border border-border text-xs px-2 py-1 rounded whitespace-nowrap">
            {w} x {h}
          </div>
        </div>
      )}
      
      <div 
        className="absolute top-4 right-4 z-[9999999] pointer-events-auto"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Button size="sm" onClick={() => onClose && onClose()} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground border-transparent shadow-lg">
          <X size={16} className="mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );
}
