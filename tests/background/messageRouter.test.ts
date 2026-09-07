import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makePinThumbnail } from '@/background/pin-thumbnail';

describe('Background Service Worker - Message Routing & Thumbnail Processing', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('makePinThumbnail', () => {
    it('returns short data URLs (<80KB) immediately without canvas resizing overhead', async () => {
      const shortDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      const thumb = await makePinThumbnail(shortDataUrl, 200);
      expect(thumb).toBe(shortDataUrl);
    });

    it('returns placeholder on fetch error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Fetch failed')));
      const hugeUrl = 'data:image/png;base64,' + 'A'.repeat(90_000);
      const thumb = await makePinThumbnail(hugeUrl, 200);
      expect(thumb).toContain('data:image/gif;base64');
    });
  });
});
