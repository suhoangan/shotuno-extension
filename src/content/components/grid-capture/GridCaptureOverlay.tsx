import { useEffect } from 'react';
import type { Region } from './checkRegionOverlap';
import { checkRegionOverlap } from './checkRegionOverlap';
import { useGridDrag } from './hooks/useGridDrag';
import { GridRegionItem } from './GridRegionItem';
import { GridCaptureToolbar } from './GridCaptureToolbar';

export default function GridCaptureOverlay({
  onCaptureAll,
  onClose,
}: {
  onCaptureAll: (regions: Region[]) => void;
  onClose?: () => void;
}) {
  const {
    regions,
    isDrawing,
    startPos,
    currentPos,
    hoverRect,
    scrollPos,
    deleteRegion,
    clearRegions,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleRegionMouseDown,
    registerBackdrop,
  } = useGridDrag();



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

  // Calculate viewport-relative positions for rendering
  const viewDrawX = Math.min(startPos.x, currentPos.x) - scrollPos.x;
  const viewDrawY = Math.min(startPos.y, currentPos.y) - scrollPos.y;
  const drawW = Math.abs(currentPos.x - startPos.x);
  const drawH = Math.abs(currentPos.y - startPos.y);

  // Real document coordinates for overlap checking
  const docDrawX = Math.min(startPos.x, currentPos.x);
  const docDrawY = Math.min(startPos.y, currentPos.y);
  const isDrawOverlapping =
    isDrawing && checkRegionOverlap({ x: docDrawX, y: docDrawY, w: drawW, h: drawH }, regions);

  return (
    <>
      <div
        id="grid-capture-overlay-backdrop"
        ref={registerBackdrop}
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
              {regions.map((r) => (
                <rect
                  key={r.id}
                  x={r.x - scrollPos.x}
                  y={r.y - scrollPos.y}
                  width={r.w}
                  height={r.h}
                  fill="black"
                />
              ))}

              {/* Cut out drawing region */}
              {isDrawing && (
                <rect x={viewDrawX} y={viewDrawY} width={drawW} height={drawH} fill="black" />
              )}

              {/* Cut out hover region */}
              {!isDrawing && hoverRect && (
                <rect
                  x={hoverRect.x - scrollPos.x}
                  y={hoverRect.y - scrollPos.y}
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
            style={{
              left: hoverRect.x - scrollPos.x,
              top: hoverRect.y - scrollPos.y,
              width: hoverRect.w,
              height: hoverRect.h,
            }}
          >
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-background/90 text-foreground border border-border text-xs px-2 py-1 rounded whitespace-nowrap">
              {Math.round(hoverRect.w)} x {Math.round(hoverRect.h)}
            </div>
          </div>
        )}

        {/* Drawing Rect Outline */}
        {isDrawing && (
          <div
            className={`absolute border-2 pointer-events-none ${
              isDrawOverlapping ? 'border-destructive' : 'border-primary'
            }`}
            style={{ left: viewDrawX, top: viewDrawY, width: drawW, height: drawH }}
          >
            <div
              className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs px-2 py-1 rounded whitespace-nowrap ${
                isDrawOverlapping
                  ? 'bg-destructive/90 text-destructive-foreground'
                  : 'bg-background/90 text-foreground border border-border'
              }`}
            >
              {drawW} x {drawH} {isDrawOverlapping ? '(Overlap)' : ''}
            </div>
          </div>
        )}

        {/* Established Regions */}
        {regions.map((region, index) => (
          <GridRegionItem
            key={region.id}
            region={region}
            index={index}
            scrollPos={scrollPos}
            onMouseDown={handleRegionMouseDown}
            onDelete={deleteRegion}
          />
        ))}
      </div>

      <GridCaptureToolbar
        regionCount={regions.length}
        onClear={clearRegions}
        onCancel={() => {
          if (onClose) onClose();
        }}
        onCaptureAll={() => onCaptureAll(regions)}
      />
    </>
  );
}
