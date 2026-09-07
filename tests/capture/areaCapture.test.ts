import { describe, it, expect, vi, beforeEach } from 'vitest';
import { viewportToDocument, documentToViewport } from '@/content/components/grid-capture/coordinateUtils';

describe('Screen Capture Engine - Area Capture & Coordinate Conversions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('viewportToDocument coordinate mapping', () => {
    it('accurately translates viewport coordinates to document space with explicit scroll', () => {
      const viewportRect = { left: 50, top: 80, width: 300, height: 200 };
      const scrollPos = { x: 120, y: 400 };

      const docRegion = viewportToDocument(viewportRect, scrollPos);

      expect(docRegion.x).toBe(170); // 50 + 120
      expect(docRegion.y).toBe(480); // 80 + 400
      expect(docRegion.w).toBe(300);
      expect(docRegion.h).toBe(200);
    });

    it('handles zero scroll position without offset distortion', () => {
      const viewportRect = { left: 0, top: 0, width: 500, height: 400 };
      const scrollPos = { x: 0, y: 0 };

      const docRegion = viewportToDocument(viewportRect, scrollPos);

      expect(docRegion.x).toBe(0);
      expect(docRegion.y).toBe(0);
      expect(docRegion.w).toBe(500);
      expect(docRegion.h).toBe(400);
    });
  });

  describe('documentToViewport reverse coordinate mapping', () => {
    it('accurately maps document coordinates back to viewport space given scroll offset', () => {
      const docRegion = { x: 500, y: 800, w: 250, h: 150 };
      const scrollPos = { x: 200, y: 300 };

      const viewportRect = documentToViewport(docRegion, scrollPos);

      expect(viewportRect.x).toBe(300); // 500 - 200
      expect(viewportRect.y).toBe(500); // 800 - 300
      expect(viewportRect.width).toBe(250);
      expect(viewportRect.height).toBe(150);
    });

    it('roundtrip from viewport to document and back preserves original geometry', () => {
      const original = { left: 75, top: 125, width: 450, height: 350 };
      const scrollPos = { x: 320, y: 640 };

      const doc = viewportToDocument(original, scrollPos);
      const roundtrip = documentToViewport(doc, scrollPos);

      expect(roundtrip.x).toBe(original.left);
      expect(roundtrip.y).toBe(original.top);
      expect(roundtrip.width).toBe(original.width);
      expect(roundtrip.height).toBe(original.height);
    });
  });
});
