import { describe, it, expect, vi, beforeEach } from 'vitest';
import { openEditorWithDataUrl, openPreviewWithUrl } from '@/lib/openEditor';

describe('Screen Capture Engine - Local Image Loader & Editor Opener', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('openEditorWithDataUrl', () => {
    it('throws error when chrome runtime is unavailable', async () => {
      vi.stubGlobal('chrome', undefined);
      await expect(openEditorWithDataUrl('data:image/png;base64,abc')).rejects.toThrow(
        'Chrome extension environment not detected',
      );
    });

    it('sends OPEN_EDITOR message with payload and succeeds on positive response', async () => {
      const mockDataUrl = 'data:image/png;base64,validImageData123';
      const sendMessageMock = vi.fn((msg: any, callback: Function) => {
        expect(msg.type).toBe('OPEN_EDITOR');
        expect(msg.payload.dataUrl).toBe(mockDataUrl);
        callback({ success: true });
      });

      vi.stubGlobal('chrome', {
        runtime: {
          sendMessage: sendMessageMock,
          lastError: null,
        },
      });

      await expect(openEditorWithDataUrl(mockDataUrl)).resolves.toBeUndefined();
      expect(sendMessageMock).toHaveBeenCalled();
    });

    it('throws error if response success is false', async () => {
      vi.stubGlobal('chrome', {
        runtime: {
          sendMessage: (_msg: any, callback: Function) => {
            callback({ success: false, error: 'Tab injection failed' });
          },
          lastError: null,
        },
      });

      await expect(openEditorWithDataUrl('data:image/png;base64,test')).rejects.toThrow('Tab injection failed');
    });

    it('throws runtime.lastError message if messaging encounters an error', async () => {
      vi.stubGlobal('chrome', {
        runtime: {
          sendMessage: (_msg: any, callback: Function) => {
            callback({});
          },
          lastError: { message: 'Receiver does not exist' },
        },
      });

      await expect(openEditorWithDataUrl('data:image/png;base64,test')).rejects.toThrow('Receiver does not exist');
    });
  });

  describe('openPreviewWithUrl', () => {
    it('sends OPEN_PREVIEW message with url payload', async () => {
      const mockUrl = 'blob:chrome-extension://preview-123';
      const sendMessageMock = vi.fn((msg: any, callback: Function) => {
        expect(msg.type).toBe('OPEN_PREVIEW');
        expect(msg.payload.url).toBe(mockUrl);
        callback({ success: true });
      });

      vi.stubGlobal('chrome', {
        runtime: {
          sendMessage: sendMessageMock,
          lastError: null,
        },
      });

      await expect(openPreviewWithUrl(mockUrl)).resolves.toBeUndefined();
      expect(sendMessageMock).toHaveBeenCalled();
    });
  });
});
