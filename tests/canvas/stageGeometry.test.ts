import { describe, it, expect } from 'vitest';
import { getContentRect, getStageBounds } from '@/content/components/canvas/stageBounds';
import {
  annotationSizeFactor,
  toImageAnnotationSize,
  toUiAnnotationSize,
  ANNOTATION_SIZE_REF_LONG_SIDE,
} from '@/content/components/canvas/annotationSize';

describe('Canvas Core - Stage Geometry & Bounds Calculations', () => {
  describe('getContentRect', () => {
    it('returns full image bounds when cropRect is null', () => {
      const image = { width: 1920, height: 1080 };
      const content = getContentRect(image, null, 'select');
      expect(content).toEqual({ x: 0, y: 0, width: 1920, height: 1080 });
    });

    it('returns cropped bounds when cropRect is present and active tool is not crop', () => {
      const image = { width: 1920, height: 1080 };
      const cropRect = { x: 200, y: 150, width: 800, height: 600 };
      const content = getContentRect(image, cropRect, 'arrow');
      expect(content).toEqual(cropRect);
    });

    it('returns full image bounds while actively using the crop tool', () => {
      const image = { width: 1920, height: 1080 };
      const cropRect = { x: 200, y: 150, width: 800, height: 600 };
      const content = getContentRect(image, cropRect, 'crop');
      expect(content).toEqual({ x: 0, y: 0, width: 1920, height: 1080 });
    });
  });

  describe('getStageBounds with window border & padding', () => {
    it('returns plain content bounds when border is disabled', () => {
      const image = { width: 1000, height: 800 };
      const borderOpts = {
        borderEnabled: false,
        borderStyle: 'none' as const,
        borderPadding: false,
        borderPaddingSize: 16,
        includeUrl: false,
        urlPosition: 'top' as const,
      };

      const bounds = getStageBounds(image, null, 'select', borderOpts);
      expect(bounds.x).toBe(0);
      expect(bounds.y).toBe(0);
      expect(bounds.width).toBe(1000);
      expect(bounds.height).toBe(800);
    });

    it('adds side padding, macos window header, and footer when border is enabled', () => {
      const image = { width: 1000, height: 800 };
      const borderOpts = {
        borderEnabled: true,
        borderStyle: 'macos' as const,
        borderPadding: true,
        borderPaddingSize: 32,
        includeUrl: true,
        urlPosition: 'bottom' as const,
      };

      const bounds = getStageBounds(image, null, 'select', borderOpts);
      expect(bounds.x).toBe(-32); // content.x - 32
      expect(bounds.y).toBeLessThan(0); // includes header height & padding
      expect(bounds.width).toBe(1000 + 32 * 2);
      expect(bounds.height).toBeGreaterThan(800 + 32 * 2);
      expect(bounds.content).toEqual({ x: 0, y: 0, width: 1000, height: 800 });
    });
  });

  describe('annotationSizeFactor & conversions', () => {
    it('returns 1.0 for a standard 1280px reference image', () => {
      const factor = annotationSizeFactor(1280, 720);
      expect(factor).toBe(1.0);
    });

    it('scales linearly for higher resolution captures (e.g. 2560px -> 2.0)', () => {
      const factor = annotationSizeFactor(2560, 1440);
      expect(factor).toBe(2.0);
    });

    it('enforces a minimum floor of 0.5 for small cropped areas', () => {
      const factor = annotationSizeFactor(200, 150);
      expect(factor).toBe(0.5);
    });

    it('converts between UI size and image pixel size seamlessly', () => {
      const factor = 2.0;
      const uiSize = 14;
      const imageSize = toImageAnnotationSize(uiSize, factor);
      expect(imageSize).toBe(28);

      const roundtripUi = toUiAnnotationSize(imageSize, factor);
      expect(roundtripUi).toBe(14);
    });
  });
});
