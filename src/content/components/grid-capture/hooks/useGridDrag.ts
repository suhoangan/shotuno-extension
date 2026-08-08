import { useState, useEffect, useRef, useCallback } from 'react';
import type { Region } from '../checkRegionOverlap';
import { checkRegionOverlap } from '../checkRegionOverlap';
import { viewportToDocument } from '../coordinateUtils';
import { calculateClampedDragRegion } from '../gridCollisionUtils';
import { getMainScrollContainer, getScrollState } from '../../../utils/scrollUtils';
import { calculateWheelScroll, performScrollStep } from './gridAutoScroll';

export function useGridDrag() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [hoverRect, setHoverRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [dragAction, setDragAction] = useState<string | null>(null);
  const [dragStartRef, setDragStartRef] = useState<{ x: number; y: number; rect: Region } | null>(null);
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });

  const lastMousePosRef = useRef({ clientX: 0, clientY: 0 });
  const autoScrollFrameRef = useRef<number | null>(null);
  const scrollContainerRef = useRef<Element | Window | null>(null);

  // Sync scroll position cleanly via native scroll events
  useEffect(() => {
    const container = getMainScrollContainer();
    scrollContainerRef.current = container;

    const handleScroll = () => setScrollPos(getScrollState(container));
    handleScroll();

    if (container === window) {
      window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
      return () => window.removeEventListener('scroll', handleScroll, { capture: true });
    } else {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleDragUpdate = useCallback((clientX: number, clientY: number) => {
    const scrollState = scrollContainerRef.current ? getScrollState(scrollContainerRef.current) : { x: 0, y: 0 };
    const pageX = clientX + scrollState.x;
    const pageY = clientY + scrollState.y;

    if (activeRegionId && dragAction && dragStartRef) {
      const { x: startX, y: startY, rect } = dragStartRef;
      const dx = pageX - startX;
      const dy = pageY - startY;

      const { clampedX, clampedY, clampedW, clampedH } = calculateClampedDragRegion(
        rect,
        dx,
        dy,
        dragAction,
        regions
      );

      setRegions(prev =>
        prev.map(r => (r.id === rect.id ? { ...r, x: clampedX, y: clampedY, w: clampedW, h: clampedH } : r))
      );
      return;
    }

    if (isDrawing) {
      setCurrentPos({ x: pageX, y: pageY });
      return;
    }

    // Check shadow root UI elements
    const shadowRoot = document.getElementById('shotuno-root')?.shadowRoot;
    if (shadowRoot) {
      const shadowElements = shadowRoot.elementsFromPoint(clientX, clientY);
      const topShadowEl = shadowElements[0];
      if (topShadowEl && topShadowEl.id !== 'grid-capture-overlay-backdrop') {
        setHoverRect(null);
        return;
      }
    }

    // Auto-snapping target detection
    setHoverRect(getTargetHoverRect(clientX, clientY, scrollState, regions));
  }, [activeRegionId, dragAction, dragStartRef, isDrawing, regions]);

function getTargetHoverRect(
  clientX: number,
  clientY: number,
  scrollState: { x: number; y: number },
  regions: Region[]
): { x: number; y: number; w: number; h: number } | null {
  const elements = document.elementsFromPoint(clientX, clientY);
  const target = elements.find((el) => el.id !== 'shotuno-root' && !el.closest('#shotuno-root'));
  if (!target || typeof target.getBoundingClientRect !== 'function') return null;
  if (target.tagName === 'HTML' || target.tagName === 'BODY') return null;

  const rect = target.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return null;

  const docRect = viewportToDocument(
    { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
    scrollState
  );

  return checkRegionOverlap(docRect, regions) ? null : docRect;
}

  // Smooth auto-scroll loop
  useEffect(() => {
    if (!isDrawing && !activeRegionId) {
      if (autoScrollFrameRef.current) {
        cancelAnimationFrame(autoScrollFrameRef.current);
        autoScrollFrameRef.current = null;
      }
      return;
    }

    const scrollLoop = () => {
      performScrollStep(lastMousePosRef.current.clientY, scrollContainerRef.current, () => {
        handleDragUpdate(lastMousePosRef.current.clientX, lastMousePosRef.current.clientY);
      });
      autoScrollFrameRef.current = requestAnimationFrame(scrollLoop);
    };

    autoScrollFrameRef.current = requestAnimationFrame(scrollLoop);
    return () => {
      if (autoScrollFrameRef.current) {
        cancelAnimationFrame(autoScrollFrameRef.current);
      }
    };
  }, [isDrawing, activeRegionId, handleDragUpdate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeRegionId) return;
    setIsDrawing(true);
    lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };

    const scrollState = scrollContainerRef.current ? getScrollState(scrollContainerRef.current) : { x: 0, y: 0 };
    const pageX = e.clientX + scrollState.x;
    const pageY = e.clientY + scrollState.y;

    setStartPos({ x: pageX, y: pageY });
    setCurrentPos({ x: pageX, y: pageY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };
    handleDragUpdate(e.clientX, e.clientY);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const container = scrollContainerRef.current || window;
    const { dx, dy } = calculateWheelScroll(e);

    if (container === window) {
      window.scrollBy(dx, dy);
    } else {
      const el = container as Element;
      el.scrollLeft += dx;
      el.scrollTop += dy;
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

    const x = Math.min(startPos.x, currentPos.x);
    const y = Math.min(startPos.y, currentPos.y);
    const w = Math.abs(currentPos.x - startPos.x);
    const h = Math.abs(currentPos.y - startPos.y);

    let newRect = null;
    if (w <= 10 && h <= 10) {
      if (hoverRect) newRect = hoverRect;
    } else {
      newRect = { x, y, w, h };
    }

    if (newRect && newRect.w > 20 && newRect.h > 20) {
      if (!checkRegionOverlap(newRect, regions)) {
        const newRegion: Region = {
          id: Math.random().toString(36).substring(7),
          ...newRect,
        };
        setRegions(prev => [...prev, newRegion]);
      }
    }
  };

  const handleRegionMouseDown = (e: React.MouseEvent, region: Region, action: string) => {
    e.stopPropagation();
    setActiveRegionId(region.id);
    setDragAction(action);
    lastMousePosRef.current = { clientX: e.clientX, clientY: e.clientY };

    const scrollState = scrollContainerRef.current ? getScrollState(scrollContainerRef.current) : { x: 0, y: 0 };
    setDragStartRef({
      x: e.clientX + scrollState.x,
      y: e.clientY + scrollState.y,
      rect: { ...region },
    });
  };

  const deleteRegion = (id: string) => {
    setRegions(prev => prev.filter(r => r.id !== id));
  };

  const clearRegions = () => {
    setRegions([]);
  };

  return {
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
    handleWheel,
    handleRegionMouseDown,
  };
}
