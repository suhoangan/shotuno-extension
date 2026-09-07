import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contentSizeFromMetrics } from '@/background/captureFullSizeScreenshot';
import { getScrollState, scrollToPosition } from '@/content/utils/scrollUtils';

describe('Screen Capture Engine - Full Page Capture & Scrolling Metrics', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('window', {
      scrollX: 0,
      scrollY: 0,
      scrollTo: vi.fn(),
    });
  });

  describe('contentSizeFromMetrics', () => {
    it('accurately parses cssContentSize with ceiling on fractions', () => {
      const metrics = {
        cssContentSize: { width: 1440.1, height: 4500.8 },
      };
      const size = contentSizeFromMetrics(metrics);
      expect(size).toEqual({ width: 1441, height: 4501 });
    });

    it('falls back to standard contentSize when cssContentSize is absent', () => {
      const metrics = {
        contentSize: { width: 1024, height: 2048 },
      };
      const size = contentSizeFromMetrics(metrics);
      expect(size).toEqual({ width: 1024, height: 2048 });
    });

    it('throws descriptive error on invalid or empty dimensions', () => {
      expect(() => contentSizeFromMetrics({})).toThrow(/measure page size/);
      expect(() => contentSizeFromMetrics({ contentSize: { width: 0, height: 500 } })).toThrow(/measure page size/);
    });
  });

  describe('Scroll Slice Generation Calculation', () => {
    it('calculates exact vertical scroll slices needed for full page stitching', () => {
      const totalHeight = 2500;
      const viewportHeight = 800;

      const slices: Array<{ y: number; height: number }> = [];
      let currentY = 0;

      while (currentY < totalHeight) {
        const remaining = totalHeight - currentY;
        const sliceH = Math.min(viewportHeight, remaining);
        slices.push({ y: currentY, height: sliceH });
        currentY += sliceH;
      }

      expect(slices).toHaveLength(4);
      expect(slices[0]).toEqual({ y: 0, height: 800 });
      expect(slices[1]).toEqual({ y: 800, height: 800 });
      expect(slices[2]).toEqual({ y: 1600, height: 800 });
      expect(slices[3]).toEqual({ y: 2400, height: 100 });
    });
  });

  describe('scrollUtils state and scroll restoration', () => {
    it('retrieves scroll state from element or window correctly', () => {
      const mockElement = { scrollLeft: 100, scrollTop: 250 } as unknown as Element;
      expect(getScrollState(mockElement)).toEqual({ x: 100, y: 250 });
    });

    it('triggers instant scrollTo on target element', () => {
      const mockElement = {
        scrollTo: vi.fn(),
      } as unknown as Element;

      scrollToPosition(mockElement, 50, 150);

      expect(mockElement.scrollTo).toHaveBeenCalledWith({
        left: 50,
        top: 150,
        behavior: 'instant',
      });
    });
  });
});
