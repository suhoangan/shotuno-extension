import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { X, Check } from 'lucide-react';
import { useScrollCapture } from './canvas/hooks/useScrollCapture';

export default function ScrollAreaCaptureOverlay({ 
  onClose,
}: { 
  onClose?: () => void;
}) {
  const [mode, setMode] = useState<'select' | 'record'>('select');
  
  // Selection state
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [hoverRect, setHoverRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  // Recording state
  const [rect, setRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);
  const { frames, isProcessing, isScrollingTooFast, handleStopAndStitch } = useScrollCapture({
    mode,
    rect,
    onClose,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);



  const handleMouseDown = (e: React.MouseEvent) => {
    if (mode !== 'select') return;
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (mode !== 'select') return;
    if (isDragging) {
      setCurrentPos({ x: e.clientX, y: e.clientY });
      return;
    }
    
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
    const r = target.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;
    return { x: r.left, y: r.top, w: r.width, h: r.height };
  }

  const handleMouseUp = () => {
    if (mode !== 'select' || !isDragging) return;
    setIsDragging(false);
    
    let x = Math.min(startPos.x, currentPos.x);
    let y = Math.min(startPos.y, currentPos.y);
    let w = Math.abs(currentPos.x - startPos.x);
    let h = Math.abs(currentPos.y - startPos.y);

    if (w <= 10 || h <= 10) {
      if (hoverRect) {
        x = hoverRect.x; y = hoverRect.y; w = hoverRect.w; h = hoverRect.h;
      } else {
        return;
      }
    }

    setRect({ x, y, w, h });
    setMode('record');
  };



  if (mode === 'select') {
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
          />
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

  // Record mode
  if (!rect) return null;
  
  return (
    <div id="capture-overlay-backdrop" className="fixed inset-0 z-[9999999] pointer-events-none">
      <div 
        className={`absolute border-2 shadow-[0_0_0_9999px_rgba(0,0,0,0.2)] pointer-events-none transition-colors duration-300 ${isScrollingTooFast ? 'border-destructive' : 'border-primary'}`}
        style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
      >
        <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 animate-pulse ${isScrollingTooFast ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'}`}>
          <div className="w-2 h-2 rounded-full bg-white" />
          {isScrollingTooFast ? 'Slow down!' : 'Recording Scroll'}
        </div>
      </div>
      
      <div 
        className="absolute z-[9999999] pointer-events-auto bg-background border border-border shadow-lg rounded-lg p-3 flex flex-col gap-2 w-48"
        style={{ 
          left: rect.x + rect.w + 16 > window.innerWidth - 200 ? rect.x - 200 - 16 : rect.x + rect.w + 16, 
          top: Math.max(16, rect.y) 
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="text-sm font-medium mb-1">Scroll down to capture</div>
        <div className="text-xs text-muted-foreground mb-3">Frames captured: {frames.length}</div>
        <Button 
          size="sm" 
          onClick={handleStopAndStitch} 
          disabled={isProcessing}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isProcessing ? 'Stitching...' : <><Check size={16} className="mr-1" /> Finish</>}
        </Button>
        <Button size="sm" variant="ghost" onClick={onClose} disabled={isProcessing} className="w-full">
          Cancel
        </Button>
      </div>
    </div>
  );
}
