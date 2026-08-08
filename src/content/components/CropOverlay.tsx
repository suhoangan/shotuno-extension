import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../../store/useEditorStore';
import type { StageBounds } from './canvas/stageBounds';
import { Button } from '../../components/ui/button';

interface CropOverlayProps {
  bounds: StageBounds;
  scale: number;
}

export const CropOverlay: React.FC<CropOverlayProps> = ({ bounds, scale }) => {
  const { cropRect, setCropRect } = useEditorStore();
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number, y: number, rect: {x: number, y: number, w: number, h: number} } | null>(null);
  const content = bounds.content;

  useEffect(() => {
    if (!isDragging) return;

    let rafId = 0;
    let latest: MouseEvent | null = null;

    const applyMove = () => {
      rafId = 0;
      const e = latest;
      latest = null;
      if (!e || !dragStartRef.current || !cropRect) return;
      const { x, y, rect } = dragStartRef.current;
      const dx = (e.clientX - x) / scale;
      const dy = (e.clientY - y) / scale;

      let newX = rect.x;
      let newY = rect.y;
      let newW = rect.w;
      let newH = rect.h;

      if (isDragging === 'move') {
        newX = Math.min(Math.max(content.x, rect.x + dx), content.x + content.width - rect.w);
        newY = Math.min(Math.max(content.y, rect.y + dy), content.y + content.height - rect.h);
      } else {
        if (isDragging.includes('left')) {
          newX = Math.min(Math.max(content.x, rect.x + dx), rect.x + rect.w - 50);
          newW = rect.w - (newX - rect.x);
        }
        if (isDragging.includes('right')) {
          newW = Math.min(Math.max(50, rect.w + dx), content.x + content.width - rect.x);
        }
        if (isDragging.includes('top')) {
          newY = Math.min(Math.max(content.y, rect.y + dy), rect.y + rect.h - 50);
          newH = rect.h - (newY - rect.y);
        }
        if (isDragging.includes('bottom')) {
          newH = Math.min(Math.max(50, rect.h + dy), content.y + content.height - rect.y);
        }
      }

      setCropRect({ x: newX, y: newY, width: newW, height: newH });
    };

    const handleMouseMove = (e: MouseEvent) => {
      latest = e;
      if (rafId) return;
      rafId = requestAnimationFrame(applyMove);
    };

    const handleMouseUp = () => {
      setIsDragging(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scale, content, cropRect, setCropRect]);

  if (!cropRect) return null;

  const handleMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    setIsDragging(handle);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rect: { x: cropRect.x, y: cropRect.y, w: cropRect.width, h: cropRect.height }
    };
  };

  // Overlay sits on the stage frame; cropRect is in image/content space.
  const r = {
    x: (cropRect.x - bounds.x) * scale,
    y: (cropRect.y - bounds.y) * scale,
    w: cropRect.width * scale,
    h: cropRect.height * scale,
    bw: bounds.width * scale,
    bh: bounds.height * scale
  };

  return (
    <div className="absolute inset-0 z-[999] pointer-events-none" style={{ width: r.bw, height: r.bh }}>
      {/* Dark overlays for cropped-out areas */}
      <div className="absolute top-0 left-0 bg-background/80 pointer-events-auto " style={{ width: '100%', height: r.y }} />
      <div className="absolute left-0 bg-background/80 pointer-events-auto " style={{ top: r.y, width: r.x, height: r.h }} />
      <div className="absolute right-0 bg-background/80 pointer-events-auto " style={{ top: r.y, width: Math.max(0, r.bw - (r.x + r.w)), height: r.h }} />
      <div className="absolute bottom-0 left-0 bg-background/80 pointer-events-auto " style={{ width: '100%', height: Math.max(0, r.bh - (r.y + r.h)) }} />

      {/* Crop Box with Grid */}
      <div
        className="absolute border-2 border-foreground/80 box-border pointer-events-auto flex flex-col cursor-move"
        style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        {/* 3x3 Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-50">
          <div className="border-r border-b border-foreground" />
          <div className="border-r border-b border-foreground" />
          <div className="border-b border-foreground" />
          <div className="border-r border-b border-foreground" />
          <div className="border-r border-b border-foreground" />
          <div className="border-b border-foreground" />
          <div className="border-r border-foreground" />
          <div className="border-r border-foreground" />
          <div className="" />
        </div>

        {/* Handles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-1/3 h-[20px] pointer-events-auto cursor-ns-resize" onMouseDown={(e) => handleMouseDown(e, 'top')} />
          <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1/3 h-[20px] pointer-events-auto cursor-ns-resize" onMouseDown={(e) => handleMouseDown(e, 'bottom')} />
          <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 h-1/3 w-[20px] pointer-events-auto cursor-ew-resize" onMouseDown={(e) => handleMouseDown(e, 'left')} />
          <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-1/3 w-[20px] pointer-events-auto cursor-ew-resize" onMouseDown={(e) => handleMouseDown(e, 'right')} />

          <div className="absolute top-[-4px] left-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nwse-resize" onMouseDown={(e) => handleMouseDown(e, 'top-left')}>
            <div className="absolute top-0 left-0 w-full h-[4px] bg-foreground shadow-sm" />
            <div className="absolute top-0 left-0 w-[4px] h-full bg-foreground shadow-sm" />
          </div>
          <div className="absolute top-[-4px] right-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nesw-resize" onMouseDown={(e) => handleMouseDown(e, 'top-right')}>
            <div className="absolute top-0 right-0 w-full h-[4px] bg-foreground shadow-sm" />
            <div className="absolute top-0 right-0 w-[4px] h-full bg-foreground shadow-sm" />
          </div>
          <div className="absolute bottom-[-4px] left-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nesw-resize" onMouseDown={(e) => handleMouseDown(e, 'bottom-left')}>
            <div className="absolute bottom-0 left-0 w-full h-[4px] bg-foreground shadow-sm" />
            <div className="absolute bottom-0 left-0 w-[4px] h-full bg-foreground shadow-sm" />
          </div>
          <div className="absolute bottom-[-4px] right-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nwse-resize" onMouseDown={(e) => handleMouseDown(e, 'bottom-right')}>
            <div className="absolute bottom-0 right-0 w-full h-[4px] bg-foreground shadow-sm" />
            <div className="absolute bottom-0 right-0 w-[4px] h-full bg-foreground shadow-sm" />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          className="absolute left-1/2 -translate-x-1/2 -bottom-14 flex gap-2 pointer-events-auto"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setCropRect(null);
              useEditorStore.getState().setActiveTool('select');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              useEditorStore.getState().saveHistory();
              useEditorStore.getState().setActiveTool('select');
            }}
            className="flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
};
