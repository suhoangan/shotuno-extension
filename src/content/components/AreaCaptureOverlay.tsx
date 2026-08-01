import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { X, Check } from 'lucide-react';

export default function AreaCaptureOverlay({ 
  onCapture,
  isMulti,
  onClose,
}: { 
  onCapture: (rect: { x: number, y: number, w: number, h: number }) => void;
  isMulti?: boolean;
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
    setHoverRect(null);
    setStartPos({ x: e.clientX, y: e.clientY });
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setCurrentPos({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Auto-snapping logic
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const target = elements.find(el => el.id !== 'shotuno-root' && !el.closest('#shotuno-root'));
    
    if (target && target.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && target.tagName !== 'HTML' && target.tagName !== 'BODY') {
        setHoverRect({ x: rect.left, y: rect.top, w: rect.width, h: rect.height });
      } else {
        setHoverRect(null);
      }
    } else {
      setHoverRect(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) {
      if (hoverRect) {
        onCapture(hoverRect);
      }
      return;
    }
    setIsDragging(false);
    
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    if (w > 10 && h > 10) {
      onCapture({ x, y, w, h });
    } else if (!isMulti) {
      // Cancelled if area is too small and not in multi mode
      onCapture({ x: 0, y: 0, w: 0, h: 0 }); 
    }
  };

  const x = Math.min(startPos.x, currentPos.x);
  const y = Math.min(startPos.y, currentPos.y);
  const w = Math.abs(currentPos.x - startPos.x);
  const h = Math.abs(currentPos.y - startPos.y);

  return (
    <div 
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
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#hole)" />
      </svg>
      {!isDragging && hoverRect && (
        <div 
          className="absolute border-2 border-primary border-dashed pointer-events-none bg-primary/10 transition-all duration-75 ease-out"
          style={{ left: hoverRect.x, top: hoverRect.y, width: hoverRect.w, height: hoverRect.h }}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/75 text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
            {Math.round(hoverRect.w)} x {Math.round(hoverRect.h)}
          </div>
        </div>
      )}
      {isDragging && (
        <div 
          className="absolute border-2 border-primary pointer-events-none"
          style={{ left: x, top: y, width: w, height: h }}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/75 text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
            {w} x {h}
          </div>
        </div>
      )}
      
      {isMulti && (
        <div className="absolute top-4 right-4 bg-background/95 backdrop-blur shadow-lg border border-border rounded-lg p-2 flex items-center gap-2 pointer-events-auto z-[9999999]">
          <span className="text-sm font-medium px-2">Multi-capture</span>
          <Button variant="outline" size="sm" onClick={() => onClose && onClose()}>
            <X size={16} className="mr-1" /> Cancel
          </Button>
          <Button size="sm" onClick={() => onClose && onClose()}>
            <Check size={16} className="mr-1" /> Done
          </Button>
        </div>
      )}
    </div>
  );
}
