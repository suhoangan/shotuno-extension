import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loadPins, PINS_STORAGE_KEY, PinImage } from '@/lib/pinDb';
import { loadGalleryImages, GalleryImage } from '@/lib/galleryDb';
import {
  partitionExpired,
  PIN_RETENTION_MS,
  GALLERY_RETENTION_MS,
} from '@/background/retention';
import { storage } from '@/lib/chromeStorage';

describe('Storage & Retention - Pins and Gallery Persistence', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.stubGlobal('chrome', {
      runtime: { lastError: null },
      storage: {
        local: {
          get: vi.fn(),
          set: vi.fn(),
        },
      },
    });
  });

  describe('loadPins from storage', () => {
    it('returns empty array if storage has no pins saved', async () => {
      vi.spyOn(storage.local, 'get').mockImplementation((_keys: any, cb?: any) => {
        if (cb) cb({});
        return Promise.resolve({});
      });

      const pins = await loadPins();
      expect(pins).toEqual([]);
    });

    it('retrieves saved pins list from local storage', async () => {
      const mockPins: PinImage[] = [
        { id: 'pin-1', url: 'data:image/png;base64,1', timestamp: Date.now(), filename: 'pin1.png' },
      ];

      vi.spyOn(storage.local, 'get').mockImplementation((_keys: any, cb?: any) => {
        if (cb) cb({ [PINS_STORAGE_KEY]: mockPins });
        return Promise.resolve({ [PINS_STORAGE_KEY]: mockPins });
      });

      const pins = await loadPins();
      expect(pins).toEqual(mockPins);
    });
  });

  describe('loadGalleryImages and cloud expiration cleanup', () => {
    it('strips expired cloud sharing metadata while preserving local file record', async () => {
      const now = Date.now();
      const mockGallery: GalleryImage[] = [
        {
          id: 'img-1',
          url: 'data:image/png;base64,1',
          timestamp: now - 1000,
          cloudUrl: 'https://shotuno.com/s/123',
          expiresAt: now - 500, // already expired
        },
        {
          id: 'img-2',
          url: 'data:image/png;base64,2',
          timestamp: now - 1000,
          cloudUrl: 'https://shotuno.com/s/456',
          expiresAt: now + 50000, // still valid
        },
      ];

      const setSpy = vi.spyOn(storage.local, 'set');
      vi.spyOn(storage.local, 'get').mockImplementation((_keys: any, cb?: any) => {
        if (cb) cb({ canvas_gallery_images: mockGallery });
        return Promise.resolve({ canvas_gallery_images: mockGallery });
      });

      const cleaned = await loadGalleryImages();

      expect(cleaned).toHaveLength(2);
      expect(cleaned[0].cloudUrl).toBeUndefined();
      expect(cleaned[1].cloudUrl).toBe('https://shotuno.com/s/456');
      expect(setSpy).toHaveBeenCalled();
    });
  });

  describe('partitionExpired Retention Rules', () => {
    it('partitions pins older than 3 days (PIN_RETENTION_MS) into expired set', () => {
      const now = 1000000000;
      const freshPin = { id: 'p1', timestamp: now - 1000 };
      const expiredPin = { id: 'p2', timestamp: now - PIN_RETENTION_MS - 5000 };

      const { kept, expired } = partitionExpired([freshPin, expiredPin], PIN_RETENTION_MS, now);

      expect(kept).toEqual([freshPin]);
      expect(expired).toEqual([expiredPin]);
    });

    it('partitions gallery items older than 30 days (GALLERY_RETENTION_MS) into expired set', () => {
      const now = 1000000000;
      const recentImage = { id: 'g1', timestamp: now - 10000 };
      const oldImage = { id: 'g2', timestamp: now - GALLERY_RETENTION_MS - 100000 };

      const { kept, expired } = partitionExpired([recentImage, oldImage], GALLERY_RETENTION_MS, now);

      expect(kept).toEqual([recentImage]);
      expect(expired).toEqual([oldImage]);
    });
  });
});
