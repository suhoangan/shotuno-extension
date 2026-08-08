import { describe, it, expect, vi, beforeEach } from 'vitest';
import { uploadAndShareCloudLink } from '../src/lib/cloudShare';

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
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({ id: 'abc123xyz' }),
    });
    vi.stubGlobal('fetch', fakeFetch);

    const dummyBlob = new Blob(['dummy content'], { type: 'image/webp' });
    const url = await uploadAndShareCloudLink(dummyBlob);

    expect(url).toBe('http://localhost:3001/s/abc123xyz');
    expect(fakeFetch).toHaveBeenCalled();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('http://localhost:3001/s/abc123xyz');
  });
});
