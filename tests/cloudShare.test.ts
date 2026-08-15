import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadAndShareCloudLink } from '../src/lib/cloudShare';
import { apiClient } from '../src/lib/api';

describe('uploadAndShareCloudLink helper', () => {
  beforeEach(() => {
    vi.stubGlobal('chrome', {
      storage: {
        local: {
          get: vi.fn((keys, callback) => callback({ authToken: 'fake-jwt-token' })),
        },
      },
    });

    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should upload blob and copy short link to clipboard', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ id: 'abc123xyz' } as any);

    const dummyBlob = new Blob(['dummy content'], { type: 'image/webp' });
    const result = await uploadAndShareCloudLink(dummyBlob);

    expect(result.id).toBe('abc123xyz');
    expect(result.url).toContain('/s/abc123xyz');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(result.url);
  });
});
