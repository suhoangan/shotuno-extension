import { describe, it, expect, vi, beforeEach } from 'vitest';
import { captureVisibleTab } from '@/content/utils/areaCapture';
import { CAPTURE_TYPES, isCaptureType, CAPTURE_MENU_TITLES } from '@/lib/captureModes';

describe('Screen Capture Engine - Visible Capture & Capture Modes', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('Capture Modes Constants & Guards', () => {
    it('defines all canonical capture modes', () => {
      expect(CAPTURE_TYPES).toContain('visible');
      expect(CAPTURE_TYPES).toContain('area');
      expect(CAPTURE_TYPES).toContain('scroll_area');
      expect(CAPTURE_TYPES).toContain('full');
      expect(CAPTURE_TYPES).toContain('pin_area');
      expect(CAPTURE_TYPES).toContain('grid');
      expect(CAPTURE_TYPES).toHaveLength(6);
    });

    it('validates capture types with isCaptureType guard', () => {
      expect(isCaptureType('visible')).toBe(true);
      expect(isCaptureType('full')).toBe(true);
      expect(isCaptureType('grid')).toBe(true);
      expect(isCaptureType('unknown_mode')).toBe(false);
    });

    it('provides descriptive context menu titles for all capture modes', () => {
      for (const mode of CAPTURE_TYPES) {
        expect(CAPTURE_MENU_TITLES[mode]).toBeDefined();
        expect(typeof CAPTURE_MENU_TITLES[mode]).toBe('string');
        expect(CAPTURE_MENU_TITLES[mode].length).toBeGreaterThan(0);
      }
    });
  });

  describe('captureVisibleTab', () => {
    it('sends CAPTURE_VISIBLE_TAB message and resolves with dataUrl', async () => {
      const mockDataUrl = 'data:image/png;base64,mockPngBytes123';
      vi.stubGlobal('chrome', {
        runtime: {
          sendMessage: (_msg: any, callback: Function) => {
            callback({ dataUrl: mockDataUrl });
          },
          lastError: null,
        },
      });

      const result = await captureVisibleTab();
      expect(result).toBe(mockDataUrl);
    });

    it('rejects with error message if runtime.lastError is present', async () => {
      vi.stubGlobal('chrome', {
        runtime: {
          sendMessage: (_msg: any, callback: Function) => {
            callback({});
          },
          lastError: { message: 'Cannot access tab permissions' },
        },
      });

      await expect(captureVisibleTab()).rejects.toThrow('Cannot access tab permissions');
    });

    it('rejects with error response if response contains error', async () => {
      vi.stubGlobal('chrome', {
        runtime: {
          sendMessage: (_msg: any, callback: Function) => {
            callback({ error: 'Tab is restricted' });
          },
          lastError: null,
        },
      });

      await expect(captureVisibleTab()).rejects.toThrow('Tab is restricted');
    });
  });
});
