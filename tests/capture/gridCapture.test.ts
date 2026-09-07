import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkRegionOverlap, Region } from '@/content/components/grid-capture/checkRegionOverlap';
import { calculateClampedDragRegion } from '@/content/components/grid-capture/gridCollisionUtils';
import { calculateWheelScroll, performScrollStep } from '@/content/components/grid-capture/hooks/gridAutoScroll';

describe('Screen Capture Engine - Grid Capture Multi-Region & Collision', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('window', {
      innerHeight: 1000,
      innerWidth: 1000,
      scrollBy: vi.fn(),
    });
  });

  describe('checkRegionOverlap', () => {
    it('returns true when two regions overlap', () => {
      const existing: Region[] = [{ id: 'r1', x: 100, y: 100, w: 200, h: 200 }];
      const candidate: Region = { id: 'r2', x: 150, y: 150, w: 100, h: 100 };
      expect(checkRegionOverlap(candidate, existing)).toBe(true);
    });

    it('returns false when regions do not overlap', () => {
      const existing: Region[] = [{ id: 'r1', x: 100, y: 100, w: 100, h: 100 }];
      const candidate: Region = { id: 'r2', x: 300, y: 300, w: 100, h: 100 };
      expect(checkRegionOverlap(candidate, existing)).toBe(false);
    });

    it('ignores region when ignoreId matches itself', () => {
      const region: Region = { id: 'r1', x: 100, y: 100, w: 100, h: 100 };
      expect(checkRegionOverlap(region, [region], region.id)).toBe(false);
    });
  });

  describe('calculateClampedDragRegion collision prevention', () => {
    it('clamps movement when region approaches document boundaries', () => {
      vi.stubGlobal('document', {
        documentElement: {
          scrollWidth: 1000,
          scrollHeight: 1000,
        },
      });

      const current: Region = { id: 'r1', x: 50, y: 50, w: 100, h: 100 };
      const otherRegions: Region[] = [];

      const result = calculateClampedDragRegion(current, -100, -100, 'move', otherRegions);

      expect(result.clampedX).toBe(0); // clamped at left boundary
      expect(result.clampedY).toBe(0); // clamped at top boundary
      expect(result.clampedW).toBe(100);
      expect(result.clampedH).toBe(100);
    });

    it('clamps movement when colliding with an adjacent region', () => {
      vi.stubGlobal('document', {
        documentElement: {
          scrollWidth: 2000,
          scrollHeight: 2000,
        },
      });

      const moving: Region = { id: 'r1', x: 100, y: 100, w: 100, h: 100 };
      const obstacle: Region = { id: 'r2', x: 250, y: 100, w: 100, h: 100 };

      // Moving right by 100 -> targetX = 200, which collides with obstacle at 250
      const result = calculateClampedDragRegion(moving, 100, 0, 'move', [moving, obstacle]);

      expect(result.clampedX).toBe(150); // clamped at obstacle.x - rect.w (250 - 100 = 150)
    });
  });

  describe('calculateWheelScroll & performScrollStep', () => {
    it('calculates wheel scroll with pixel delta mode', () => {
      const event = { deltaY: 25, deltaX: 10, deltaMode: 0 } as unknown as WheelEvent;
      const { dx, dy } = calculateWheelScroll(event);
      expect(dx).toBe(10);
      expect(dy).toBe(25);
    });

    it('calculates wheel scroll with line delta mode (mode 1)', () => {
      const event = { deltaY: 2, deltaX: 1, deltaMode: 1 } as unknown as WheelEvent;
      const { dx, dy } = calculateWheelScroll(event);
      expect(dx).toBe(60);
      expect(dy).toBe(120);
    });

    it('scrolls container when pointer approaches top margin', () => {
      const onScrollUpdated = vi.fn();
      const mockElement = { scrollTop: 500 } as unknown as Element;

      performScrollStep(50, mockElement, onScrollUpdated);

      expect(mockElement.scrollTop).toBeLessThan(500);
      expect(onScrollUpdated).toHaveBeenCalled();
    });
  });
});
