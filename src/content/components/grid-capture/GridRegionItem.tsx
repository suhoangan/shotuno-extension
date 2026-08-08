import React from 'react';
import type { Region } from './checkRegionOverlap';
import { Button } from '../../../components/ui/button';

interface GridRegionItemProps {
  region: Region;
  index: number;
  scrollPos: { x: number; y: number };
  onMouseDown: (e: React.MouseEvent, region: Region, action: string) => void;
  onDelete: (id: string) => void;
}

export function GridRegionItem({
  region,
  index,
  scrollPos,
  onMouseDown,
  onDelete,
}: GridRegionItemProps) {
  const viewX = region.x - scrollPos.x;
  const viewY = region.y - scrollPos.y;

  return (
    <div
      className="absolute border-2 border-primary box-border pointer-events-auto flex flex-col cursor-move group"
      style={{ left: viewX, top: viewY, width: region.w, height: region.h }}
      onMouseDown={(e) => onMouseDown(e, region, 'move')}
    >
      {/* Number badge */}
      <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-md z-10">
        {index + 1}
      </div>

      {/* Delete button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute -top-3 -right-3 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity p-0"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(region.id);
        }}
        title="Remove region"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </Button>

      {/* Handles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-1/3 h-[20px] pointer-events-auto cursor-ns-resize" onMouseDown={(e) => onMouseDown(e, region, 'top')} />
        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1/3 h-[20px] pointer-events-auto cursor-ns-resize" onMouseDown={(e) => onMouseDown(e, region, 'bottom')} />
        <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 h-1/3 w-[20px] pointer-events-auto cursor-ew-resize" onMouseDown={(e) => onMouseDown(e, region, 'left')} />
        <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 h-1/3 w-[20px] pointer-events-auto cursor-ew-resize" onMouseDown={(e) => onMouseDown(e, region, 'right')} />

        <div className="absolute top-[-4px] left-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nwse-resize" onMouseDown={(e) => onMouseDown(e, region, 'top-left')}>
          <div className="absolute top-0 left-0 w-full h-[4px] bg-primary shadow-sm" />
          <div className="absolute top-0 left-0 w-[4px] h-full bg-primary shadow-sm" />
        </div>
        <div className="absolute top-[-4px] right-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nesw-resize" onMouseDown={(e) => onMouseDown(e, region, 'top-right')}>
          <div className="absolute top-0 right-0 w-full h-[4px] bg-primary shadow-sm" />
          <div className="absolute top-0 right-0 w-[4px] h-full bg-primary shadow-sm" />
        </div>
        <div className="absolute bottom-[-4px] left-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nesw-resize" onMouseDown={(e) => onMouseDown(e, region, 'bottom-left')}>
          <div className="absolute bottom-0 left-0 w-full h-[4px] bg-primary shadow-sm" />
          <div className="absolute bottom-0 left-0 w-[4px] h-full bg-primary shadow-sm" />
        </div>
        <div className="absolute bottom-[-4px] right-[-4px] w-[20px] h-[20px] pointer-events-auto cursor-nwse-resize" onMouseDown={(e) => onMouseDown(e, region, 'bottom-right')}>
          <div className="absolute bottom-0 right-0 w-full h-[4px] bg-primary shadow-sm" />
          <div className="absolute bottom-0 right-0 w-[4px] h-full bg-primary shadow-sm" />
        </div>
      </div>
    </div>
  );
}
