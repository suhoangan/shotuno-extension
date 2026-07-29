import React, { useState } from 'react';

export default function AreaCaptureOverlay({ onCapture }: { onCapture: (rect: { x: number, y: number, w: number, h: number }) => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });

  // Use fixed positioning directly on document body to ensure it spans the whole viewport
  // because the shadow DOM container might be constrained if not careful, though we set it to 100vw/100vh.
  // Actually, returning a div here is fine since our root is fixed inset-0.

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setCurrentPos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    if (w > 10 && h > 10) {
      onCapture({ x, y, w, h });
    } else {
      // Cancelled if area is too small
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
    </div>
  );
}
