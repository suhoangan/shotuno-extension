import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadAndShareCloudLink } from '@/lib/cloudShare';
import { apiClient } from '@/lib/api';

describe('Export & Output - Cloud Link Sharing API', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('uploadAndShareCloudLink', () => {
    it('uploads image blob, generates public short link, and copies to clipboard', async () => {
      const mockBlob = new Blob(['image-bytes'], { type: 'image/png' });
      const mockApiResponse = { id: 'shot-abc-123' };

      vi.spyOn(apiClient, 'post').mockResolvedValue(mockApiResponse);
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      vi.stubGlobal('navigator', {
        clipboard: { writeText: writeTextMock },
      });

      const result = await uploadAndShareCloudLink(mockBlob);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/screenshots/upload',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );

      expect(result.id).toBe('shot-abc-123');
      expect(result.url).toContain('/s/shot-abc-123');
      expect(writeTextMock).toHaveBeenCalledWith(result.url);
    });

    it('handles base64 dataUrl input by fetching blob first', async () => {
      const mockDataUrl = 'data:image/png;base64,mockPng';
      const mockBlob = new Blob(['bytes'], { type: 'image/png' });

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        blob: vi.fn().mockResolvedValue(mockBlob),
      }));

      vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'share-999' });
      vi.stubGlobal('navigator', {
        clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
      });

      const result = await uploadAndShareCloudLink(mockDataUrl);
      expect(result.id).toBe('share-999');
    });
  });
});
