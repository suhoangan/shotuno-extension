import { describe, it, expect, vi, beforeEach } from 'vitest';
import { copyImageAndTextToClipboard, ensurePngBlob } from '@/content/utils/clipboardUtils';
import { limitedDimensions, MAX_IMPORT_EDGE } from '@/lib/limitImageResolution';

describe('Export & Output - Clipboard Operations and Image Resolution Limits', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('ensurePngBlob', () => {
    it('returns original blob directly if already image/png', async () => {
      const pngBlob = new Blob(['png-bytes'], { type: 'image/png' });
      const result = await ensurePngBlob(pngBlob);
      expect(result).toBe(pngBlob);
      expect(result.type).toBe('image/png');
    });
  });

  describe('copyImageAndTextToClipboard', () => {
    it('writes ClipboardItem with image/png and text formats to navigator.clipboard', async () => {
      const writeMock = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', {
        clipboard: { write: writeMock },
      });

      vi.stubGlobal('ClipboardItem', class {
        data: any;
        constructor(data: any) {
          this.data = data;
        }
      });

      const pngBlob = new Blob(['png'], { type: 'image/png' });
      const success = await copyImageAndTextToClipboard(pngBlob, 'Annotation note');

      expect(success).toBe(true);
      expect(writeMock).toHaveBeenCalled();
    });
  });

  describe('limitedDimensions', () => {
    it('returns scale 1 if image is within safe resolution limits', () => {
      const { width, height, scale } = limitedDimensions(1920, 1080, MAX_IMPORT_EDGE);
      expect(width).toBe(1920);
      expect(height).toBe(1080);
      expect(scale).toBe(1);
    });

    it('scales down oversized images while maintaining aspect ratio', () => {
      const maxDim = 2000;
      const { width, height, scale } = limitedDimensions(6000, 3000, maxDim);
      expect(width).toBe(2000);
      expect(height).toBe(1000);
      expect(scale).toBeCloseTo(2000 / 6000, 4);
    });

    it('preserves full stitched height for very tall captures (ratio > 2:1)', () => {
      const maxDim = 2000;
      const { width, height } = limitedDimensions(2000, 8000, maxDim);
      expect(width).toBe(2000);
      expect(height).toBe(8000); // not capped because it is a tall full-page capture
    });
  });
});
