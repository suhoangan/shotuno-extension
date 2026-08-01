import React, { useState, useEffect } from 'react';
import type { Region } from './checkRegionOverlap';
import { checkRegionOverlap } from './checkRegionOverlap';

export default function GridCaptureOverlay({
  onCaptureAll,
  onClose,
}: {
  onCaptureAll: (regions: Region[]) => void;
  onClose?: () => void;
}) {
  const [regions, setRegions] = useState<Region[]>([]);
  
  // Drag state for creating a new region
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  
  // Hover state for auto-snapping (v1 - same as AreaCaptureOverlay)
  const [hoverRect, setHoverRect] = useState<{ x: number, y: number, w: number, h: number } | null>(null);

  // Drag state for moving/resizing an existing region
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [dragAction, setDragAction] = useState<string | null>(null); // 'move', 'left', 'right', 'top', 'bottom', 'top-left', etc.
  const [dragStartRef, setDragStartRef] = useState<{ x: number, y: number, rect: Region } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
      }
      if (e.key === 'Enter') {
        onCaptureAll(regions);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onCaptureAll, regions]);

  // Handle interactions for creating new regions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeRegionId) return; // Clicking inside a region or handle
    
    setIsDrawing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (activeRegionId && dragAction && dragStartRef) {
      // Moving or resizing an existing region
      const { x: startX, y: startY, rect } = dragStartRef;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      let clampedX = rect.x;
      let clampedY = rect.y;
      let clampedW = rect.w;
      let clampedH = rect.h;

      if (dragAction === 'move') {
        const targetX = rect.x + dx;
        const targetY = rect.y + dy;

        let minX = 0;
        let maxX = window.innerWidth - rect.w;
        let minY = 0;
        let maxY = window.innerHeight - rect.h;

        for (const other of regions) {
          if (other.id === rect.id) continue;

          const targetOverlaps = 
            targetX < other.x + other.w && 
            targetX + rect.w > other.x &&
            targetY < other.y + other.h && 
            targetY + rect.h > other.y;

          if (targetOverlaps) {
            const originallyOverlapsY = rect.y < other.y + other.h && rect.y + rect.h > other.y;
            const originallyOverlapsX = rect.x < other.x + other.w && rect.x + rect.w > other.x;

            if (originallyOverlapsY && !originallyOverlapsX) {
              if (dx > 0) maxX = Math.min(maxX, other.x - rect.w);
              else if (dx < 0) minX = Math.max(minX, other.x + other.w);
            } else if (originallyOverlapsX && !originallyOverlapsY) {
              if (dy > 0) maxY = Math.min(maxY, other.y - rect.h);
              else if (dy < 0) minY = Math.max(minY, other.y + other.h);
            } else {
              if (dx > 0) maxX = Math.min(maxX, other.x - rect.w);
              else if (dx < 0) minX = Math.max(minX, other.x + other.w);
              if (dy > 0) maxY = Math.min(maxY, other.y - rect.h);
              else if (dy < 0) minY = Math.max(minY, other.y + other.h);
            }
          }
        }
        
        clampedX = Math.max(minX, Math.min(targetX, maxX));
        clampedY = Math.max(minY, Math.min(targetY, maxY));
      } else {
        let minX = 0;
        let maxX = rect.x + rect.w - 20;
        let maxW = window.innerWidth - rect.x;
        
        let minY = 0;
        let maxY = rect.y + rect.h - 20;
        let maxH = window.innerHeight - rect.y;

        const targetX = dragAction.includes('left') ? rect.x + dx : rect.x;
        const targetW = dragAction.includes('left') ? rect.w - dx : (dragAction.includes('right') ? rect.w + dx : rect.w);
        const targetY = dragAction.includes('top') ? rect.y + dy : rect.y;
        const targetH = dragAction.includes('top') ? rect.h - dy : (dragAction.includes('bottom') ? rect.h + dy : rect.h);

        for (const other of regions) {
          if (other.id === rect.id) continue;

          const targetOverlaps = 
            targetX < other.x + other.w && 
            targetX + targetW > other.x &&
            targetY < other.y + other.h && 
            targetY + targetH > other.y;

          if (targetOverlaps) {
            const originallyOverlapsY = rect.y < other.y + other.h && rect.y + rect.h > other.y;
            const originallyOverlapsX = rect.x < other.x + other.w && rect.x + rect.w > other.x;

            if (originallyOverlapsY && !originallyOverlapsX) {
              if (dragAction.includes('left')) minX = Math.max(minX, other.x + other.w);
              if (dragAction.includes('right')) maxW = Math.min(maxW, other.x - rect.x);
            } else if (originallyOverlapsX && !originallyOverlapsY) {
              if (dragAction.includes('top')) minY = Math.max(minY, other.y + other.h);
              if (dragAction.includes('bottom')) maxH = Math.min(maxH, other.y - rect.y);
            } else {
              if (dragAction.includes('left')) minX = Math.max(minX, other.x + other.w);
              if (dragAction.includes('right')) maxW = Math.min(maxW, other.x - rect.x);
              if (dragAction.includes('top')) minY = Math.max(minY, other.y + other.h);
              if (dragAction.includes('bottom')) maxH = Math.min(maxH, other.y - rect.y);
            }
          }
        }

        if (dragAction.includes('left')) {
          clampedX = Math.max(minX, Math.min(targetX, maxX));
          clampedW = rect.w - (clampedX - rect.x);
        } else if (dragAction.includes('right')) {
          clampedW = Math.max(20, Math.min(targetW, maxW));
        }

        if (dragAction.includes('top')) {
          clampedY = Math.max(minY, Math.min(targetY, maxY));
          clampedH = rect.h - (clampedY - rect.y);
        } else if (dragAction.includes('bottom')) {
          clampedH = Math.max(20, Math.min(targetH, maxH));
        }
      }

      setRegions(prev => prev.map(r => r.id === rect.id ? { ...r, x: clampedX, y: clampedY, w: clampedW, h: clampedH } : r));
      return;
    }

    if (isDrawing) {
      setCurrentPos({ x: e.clientX, y: e.clientY });
      return;
    }
    
    // Check if hovering over extension UI controls (Toolbar, buttons, regions)
    const shadowRoot = document.getElementById('shotuno-root')?.shadowRoot;
    if (shadowRoot) {
      const shadowElements = shadowRoot.elementsFromPoint(e.clientX, e.clientY);
      const topShadowEl = shadowElements[0];
      if (topShadowEl && topShadowEl.id !== 'grid-capture-overlay-backdrop') {
        setHoverRect(null);
        return;
      }
    }
    
    // Auto-snapping logic for hover
    const elements = document.elementsFromPoint(e.clientX, e.clientY);
    const target = elements.find(el => el.id !== 'shotuno-root' && !el.closest('#shotuno-root'));
    
    if (target && target.getBoundingClientRect) {
      const rect = target.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && target.tagName !== 'HTML' && target.tagName !== 'BODY') {
        const hRect = { x: rect.left, y: rect.top, w: rect.width, h: rect.height };
        if (!checkRegionOverlap(hRect, regions)) {
          setHoverRect(hRect);
        } else {
          setHoverRect(null);
        }
      } else {
        setHoverRect(null);
      }
    } else {
      setHoverRect(null);
    }
  };

  const handleMouseUp = () => {
    if (activeRegionId) {
      setActiveRegionId(null);
      setDragAction(null);
      setDragStartRef(null);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    
    let x = Math.min(startPos.x, currentPos.x);
    let y = Math.min(startPos.y, currentPos.y);
    let w = Math.abs(currentPos.x - startPos.x);
    let h = Math.abs(currentPos.y - startPos.y);

    let newRect = null;

    if (w <= 10 && h <= 10) {
      if (hoverRect) {
        newRect = hoverRect;
      }
    } else {
      newRect = { x, y, w, h };
    }

    if (newRect) {
      // Ensure width and height are reasonably large
      if (newRect.w > 20 && newRect.h > 20) {
        if (!checkRegionOverlap(newRect, regions)) {
          const newRegion: Region = {
            id: Math.random().toString(36).substring(7),
            ...newRect
          };
          setRegions(prev => [...prev, newRegion]);
        }
      }
    }
  };

  const handleRegionMouseDown = (e: React.MouseEvent, region: Region, action: string) => {
    e.stopPropagation();
    setActiveRegionId(region.id);
    setDragAction(action);
    setDragStartRef({
      x: e.clientX,
      y: e.clientY,
      rect: { ...region }
    });
  };

  const deleteRegion = (id: string) => {
    setRegions(prev => prev.filter(r => r.id !== id));
  };

  // Current drawing rectangle
  const drawX = Math.min(startPos.x, currentPos.x);
  const drawY = Math.min(startPos.y, currentPos.y);
  const drawW = Math.abs(currentPos.x - startPos.x);
  const drawH = Math.abs(currentPos.y - startPos.y);
  const isDrawOverlapping = isDrawing && checkRegionOverlap({ x: drawX, y: drawY, w: drawW, h: drawH }, regions);

  return (
    <div 
      id="grid-capture-overlay-backdrop"
      className="fixed inset-0 z-[9999999] cursor-crosshair pointer-events-auto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <mask id="grid-hole">
            <rect width="100%" height="100%" fill="white" />
            
            {/* Cut out all established regions */}
            {regions.map(r => (
              <rect key={r.id} x={r.x} y={r.y} width={r.w} height={r.h} fill="black" />
            ))}

            {/* Cut out drawing region */}
            {isDrawing && <rect x={drawX} y={drawY} width={drawW} height={drawH} fill="black" />}
            
            {/* Cut out hover region */}
            {!isDrawing && hoverRect && (
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
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#grid-hole)" />
      </svg>

      {/* Hover Rect Outline */}
      {!isDrawing && hoverRect && (
        <div 
          className="absolute border-2 border-primary border-dashed pointer-events-none transition-all duration-150 ease-out"
          style={{ left: hoverRect.x, top: hoverRect.y, width: hoverRect.w, height: hoverRect.h }}
        >
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black/75 text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
            {Math.round(hoverRect.w)} x {Math.round(hoverRect.h)}
          </div>
        </div>
      )}

      {/* Drawing Rect Outline */}
      {isDrawing && (
        <div 
          className={`absolute border-2 pointer-events-none ${isDrawOverlapping ? 'border-destructive' : 'border-primary'}`}
          style={{ left: drawX, top: drawY, width: drawW, height: drawH }}
        >
          <div className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded whitespace-nowrap ${isDrawOverlapping ? 'bg-destructive/90 text-destructive-foreground' : 'bg-black/75 text-primary-foreground'}`}>
            {drawW} x {drawH} {isDrawOverlapping ? '(Overlap)' : ''}
          </div>
        </div>
      )}

      {/* Established Regions */}
      {regions.map((region, index) => (
        <div 
          key={region.id}
          className="absolute border-2 border-primary box-border pointer-events-auto flex flex-col cursor-move group"
          style={{ left: region.x, top: region.y, width: region.w, height: region.h }}
          onMouseDown={(e) => handleRegionMouseDown(e, region, 'move')}
        >
          {/* Number badge */}
          <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md z-10">
            {index + 1}
          </div>

          {/* Delete button */}
          <button 
            className="absolute -top-3 -right-3 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => { e.stopPropagation(); deleteRegion(region.id); }}
            title="Remove region"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>

          {/* Handles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-1/3 h-[20px] pointer-events-auto cursor-ns-resize" onMouseDown={(e) => handleRegionMouseDown(e, region, 'top')} />
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1/3 h-[20px] pointer-events-auto cursor-ns-resize" onMouseDown={(e) => handleRegionMouseDown(e, region, 'bottom')} />
            <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 h-1/3 w-[20px] pointer-events-auto cursor-ew-resize" onMouseDown={(e) => handleRegionMouseDown(e, region, 'left')} />
            <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-1/3 w-[20px] pointer-events-auto cursor-ew-resize" onMouseDown={(e) => handleRegionMouseDown(e, region, 'right')} />

            <div className="absolute top-[-4px] left-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nwse-resize" onMouseDown={(e) => handleRegionMouseDown(e, region, 'top-left')}>
              <div className="absolute top-0 left-0 w-full h-[4px] bg-primary shadow-sm" />
              <div className="absolute top-0 left-0 w-[4px] h-full bg-primary shadow-sm" />
            </div>
            <div className="absolute top-[-4px] right-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nesw-resize" onMouseDown={(e) => handleRegionMouseDown(e, region, 'top-right')}>
              <div className="absolute top-0 right-0 w-full h-[4px] bg-primary shadow-sm" />
              <div className="absolute top-0 right-0 w-[4px] h-full bg-primary shadow-sm" />
            </div>
            <div className="absolute bottom-[-4px] left-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nesw-resize" onMouseDown={(e) => handleRegionMouseDown(e, region, 'bottom-left')}>
              <div className="absolute bottom-0 left-0 w-full h-[4px] bg-primary shadow-sm" />
              <div className="absolute bottom-0 left-0 w-[4px] h-full bg-primary shadow-sm" />
            </div>
            <div className="absolute bottom-[-4px] right-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nwse-resize" onMouseDown={(e) => handleRegionMouseDown(e, region, 'bottom-right')}>
              <div className="absolute bottom-0 right-0 w-full h-[4px] bg-primary shadow-sm" />
              <div className="absolute bottom-0 right-0 w-[4px] h-full bg-primary shadow-sm" />
            </div>
          </div>
        </div>
      ))}

      {/* Toolbar */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 bg-card/95 border border-border shadow-lg rounded-xl flex items-center gap-2 px-4 py-2 pointer-events-auto backdrop-blur-sm"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center justify-center mr-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Grid Capture</span>
          <span className="text-sm font-medium text-foreground">{regions.length} region{regions.length !== 1 ? 's' : ''}</span>
        </div>
        <div className="w-px h-8 bg-border mx-1" />
        <button
          onClick={() => setRegions([])}
          disabled={regions.length === 0}
          className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          Clear All
        </button>
        <button
          onClick={() => { if (onClose) onClose(); }}
          className="px-3 py-1.5 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors shadow-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => onCaptureAll(regions)}
          disabled={regions.length === 0}
          className="px-4 py-1.5 bg-primary text-primary-foreground text-sm font-medium rounded-md shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Capture All
        </button>
      </div>
    </div>
  );
}
