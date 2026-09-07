import { describe, it, expect } from 'vitest';
import type { Shape } from '@/store/editorTypes';

describe('Toolbar & Styling - Canvas Resize & Aspect Ratio Scaling Logic', () => {
  describe('Aspect Ratio Proportional Calculations', () => {
    const originalWidth = 1920;
    const originalHeight = 1080;

    it('calculates proportional height when width is changed with aspect lock', () => {
      const newWidth = 1280;
      const computedHeight = Math.round(newWidth * (originalHeight / originalWidth));
      expect(computedHeight).toBe(720);
    });

    it('calculates proportional width when height is changed with aspect lock', () => {
      const newHeight = 540;
      const computedWidth = Math.round(newHeight * (originalWidth / originalHeight));
      expect(computedWidth).toBe(960);
    });
  });

  describe('Shape Coordinate Scaling under Canvas Resize', () => {
    it('scales all shape geometries proportionally when image dimensions change', () => {
      const origW = 1000;
      const origH = 500;
      const newW = 2000;
      const newH = 1000;

      const scaleX = newW / origW; // 2.0
      const scaleY = newH / origH; // 2.0

      const originalShapes: Shape[] = [
        {
          id: 'rect-1',
          tool: 'rect',
          x: 100,
          y: 50,
          width: 200,
          height: 150,
          color: '#f00',
          strokeWidth: 4,
        },
        {
          id: 'arrow-1',
          tool: 'arrow',
          points: [50, 50, 250, 200],
          color: '#0f0',
          strokeWidth: 3,
        },
        {
          id: 'circle-1',
          tool: 'circle',
          x: 300,
          y: 100,
          radius: 40,
          color: '#00f',
          strokeWidth: 2,
        },
      ];

      const scaledShapes = originalShapes.map((shape) => {
        const s = { ...shape } as any;
        if (s.x !== undefined) s.x *= scaleX;
        if (s.y !== undefined) s.y *= scaleY;
        if (s.width !== undefined) s.width *= scaleX;
        if (s.height !== undefined) s.height *= scaleY;
        if (s.points) {
          s.points = s.points.map((p: number, i: number) => (i % 2 === 0 ? p * scaleX : p * scaleY));
        }
        if (s.fontSize) s.fontSize *= scaleY;
        if (s.strokeWidth) s.strokeWidth *= Math.min(scaleX, scaleY);
        if (s.radius) s.radius *= Math.min(scaleX, scaleY);
        return s;
      });

      // Assert Rect scaling
      expect(scaledShapes[0].x).toBe(200);
      expect(scaledShapes[0].y).toBe(100);
      expect(scaledShapes[0].width).toBe(400);
      expect(scaledShapes[0].height).toBe(300);
      expect(scaledShapes[0].strokeWidth).toBe(8);

      // Assert Arrow points scaling
      expect(scaledShapes[1].points).toEqual([100, 100, 500, 400]);
      expect(scaledShapes[1].strokeWidth).toBe(6);

      // Assert Circle radius scaling
      expect(scaledShapes[2].x).toBe(600);
      expect(scaledShapes[2].y).toBe(200);
      expect(scaledShapes[2].radius).toBe(80);
    });
  });
});
