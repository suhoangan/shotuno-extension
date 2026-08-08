import type { Region } from './checkRegionOverlap';

function clampMoveRegion(
  rect: Region,
  dx: number,
  dy: number,
  regions: Region[]
): { clampedX: number; clampedY: number; clampedW: number; clampedH: number } {
  const targetX = rect.x + dx;
  const targetY = rect.y + dy;
  let minX = 0;
  let maxX = document.documentElement.scrollWidth - rect.w;
  let minY = 0;
  let maxY = document.documentElement.scrollHeight - rect.h;

  for (const other of regions) {
    if (other.id === rect.id) continue;
    const targetOverlaps =
      targetX < other.x + other.w &&
      targetX + rect.w > other.x &&
      targetY < other.y + other.h &&
      targetY + rect.h > other.y;

    if (!targetOverlaps) continue;

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

  return {
    clampedX: Math.max(minX, Math.min(targetX, maxX)),
    clampedY: Math.max(minY, Math.min(targetY, maxY)),
    clampedW: rect.w,
    clampedH: rect.h,
  };
}

function clampResizeRegion(
  rect: Region,
  dx: number,
  dy: number,
  dragAction: string,
  regions: Region[]
): { clampedX: number; clampedY: number; clampedW: number; clampedH: number } {
  let minX = 0;
  let maxX = rect.x + rect.w - 20;
  let maxW = document.documentElement.scrollWidth - rect.x;
  let minY = 0;
  let maxY = rect.y + rect.h - 20;
  let maxH = document.documentElement.scrollHeight - rect.y;

  const targetX = dragAction.includes('left') ? rect.x + dx : rect.x;
  const targetW = dragAction.includes('left')
    ? rect.w - dx
    : dragAction.includes('right')
    ? rect.w + dx
    : rect.w;
  const targetY = dragAction.includes('top') ? rect.y + dy : rect.y;
  const targetH = dragAction.includes('top')
    ? rect.h - dy
    : dragAction.includes('bottom')
    ? rect.h + dy
    : rect.h;

  for (const other of regions) {
    if (other.id === rect.id) continue;
    const targetOverlaps =
      targetX < other.x + other.w &&
      targetX + targetW > other.x &&
      targetY < other.y + other.h &&
      targetY + targetH > other.y;

    if (!targetOverlaps) continue;

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

  let clampedX = rect.x;
  let clampedY = rect.y;
  let clampedW = rect.w;
  let clampedH = rect.h;

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

  return { clampedX, clampedY, clampedW, clampedH };
}

export function calculateClampedDragRegion(
  rect: Region,
  dx: number,
  dy: number,
  dragAction: string,
  regions: Region[]
): { clampedX: number; clampedY: number; clampedW: number; clampedH: number } {
  if (dragAction === 'move') {
    return clampMoveRegion(rect, dx, dy, regions);
  }
  return clampResizeRegion(rect, dx, dy, dragAction, regions);
}
