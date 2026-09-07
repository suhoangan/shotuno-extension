import { describe, it, expect, vi, beforeEach } from 'vitest';
import { extractTextFromImage } from '@/content/utils/extractText';

describe('AI Tools - Optical Character Recognition (OCR)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('extractTextFromImage', () => {
    it('returns empty string immediately when region width or height is zero', async () => {
      const mockImage = {} as HTMLImageElement;
      const emptyRect = { x: 0, y: 0, width: 0, height: 100 };

      const result = await extractTextFromImage(mockImage, emptyRect);
      expect(result).toBe('');
    });

    it('crops image on canvas and calls Tesseract recognize', async () => {
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn().mockReturnValue({
          drawImage: vi.fn(),
        }),
        toDataURL: vi.fn().mockReturnValue('data:image/png;base64,mockRegionPng'),
      };

      vi.stubGlobal('document', {
        createElement: vi.fn().mockImplementation((tag) => {
          if (tag === 'canvas') return mockCanvas;
          return {};
        }),
      });

      vi.mock('tesseract.js', () => ({
        default: {
          recognize: vi.fn().mockResolvedValue({
            data: { text: '  Recognized Code Snippet 123  \n' },
          }),
        },
      }));

      const mockImage = {} as HTMLImageElement;
      const rect = { x: 10, y: 20, width: 200, height: 80 };

      const text = await extractTextFromImage(mockImage, rect);
      expect(text).toBe('Recognized Code Snippet 123');
    });

    it('throws error when canvas 2D context cannot be initialized', async () => {
      vi.stubGlobal('document', {
        createElement: vi.fn().mockReturnValue({
          getContext: vi.fn().mockReturnValue(null),
        }),
      });

      const mockImage = {} as HTMLImageElement;
      const rect = { x: 0, y: 0, width: 100, height: 50 };

      await expect(extractTextFromImage(mockImage, rect)).rejects.toThrow('Could not get canvas context');
    });
  });
});
