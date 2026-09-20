import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getCaptureSettings,
  saveCaptureSettings,
  DEFAULT_CAPTURE_SETTINGS,
  CAPTURE_SETTINGS_KEY,
} from '@/lib/captureSettings';
import { handleAutoPinSave, MAX_AUTO_PINS } from '@/background/auto-pin-handler';
import { PINS_STORAGE_KEY, PinImage } from '@/lib/pinDb';
import { storage } from '@/lib/chromeStorage';

vi.mock('idb-keyval', () => ({
  set: vi.fn().mockResolvedValue(undefined),
  del: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/background/pin-thumbnail', () => ({
  makePinThumbnail: vi.fn(async (url: string) => url),
}));

describe('Capture Settings & Auto-Pin Logic', () => {
  let mockStorageStore: Record<string, any> = {};

  beforeEach(() => {
    vi.restoreAllMocks();
    mockStorageStore = {};

    vi.stubGlobal('chrome', {
      runtime: { lastError: null, sendMessage: vi.fn() },
      storage: {
        local: {
          get: vi.fn((keys: any, cb?: any) => {
            const res: Record<string, any> = {};
            const keyList = Array.isArray(keys) ? keys : typeof keys === 'string' ? [keys] : Object.keys(keys);
            for (const k of keyList) {
              if (mockStorageStore[k] !== undefined) res[k] = mockStorageStore[k];
            }
            if (cb) cb(res);
            return Promise.resolve(res);
          }),
          set: vi.fn((items: Record<string, any>, cb?: any) => {
            Object.assign(mockStorageStore, items);
            if (cb) cb();
            return Promise.resolve();
          }),
        },
      },
    });

    vi.spyOn(storage.local, 'get').mockImplementation((keys: any, cb?: any) => {
      const res: Record<string, any> = {};
      const keyList = Array.isArray(keys) ? keys : typeof keys === 'string' ? [keys] : Object.keys(keys);
      for (const k of keyList) {
        if (mockStorageStore[k] !== undefined) res[k] = mockStorageStore[k];
      }
      if (cb) cb(res);
      return Promise.resolve(res);
    });

    vi.spyOn(storage.local, 'set').mockImplementation((items: Record<string, any>, cb?: any) => {
      Object.assign(mockStorageStore, items);
      if (cb) cb();
      return Promise.resolve();
    });
  });

  describe('getCaptureSettings', () => {
    it('returns default settings when storage is empty', async () => {
      const settings = await getCaptureSettings();
      expect(settings).toEqual(DEFAULT_CAPTURE_SETTINGS);
      expect(settings.iconAction).toBe('popup');
      expect(settings.postCaptureAction).toBe('open_editor');
      expect(settings.autoPinEnabled).toBe(false);
      expect(settings.autoPinMaxLimit).toBe(3);
      expect(settings.downloadFormat).toBe('png');
    });

    it('returns stored values merged with defaults', async () => {
      mockStorageStore[CAPTURE_SETTINGS_KEY] = {
        iconAction: 'area',
        postCaptureAction: 'copy_clipboard',
        autoPinEnabled: true,
        downloadFormat: 'webp',
      };

      const settings = await getCaptureSettings();
      expect(settings.iconAction).toBe('area');
      expect(settings.postCaptureAction).toBe('copy_clipboard');
      expect(settings.autoPinEnabled).toBe(true);
      expect(settings.downloadFormat).toBe('webp');
      expect(settings.autoPinMaxLimit).toBe(3);
    });
  });

  describe('saveCaptureSettings', () => {
    it('persists updated settings to storage.local', async () => {
      await saveCaptureSettings({ iconAction: 'full', downloadFormat: 'jpg' });
      expect(mockStorageStore[CAPTURE_SETTINGS_KEY]).toBeDefined();
      expect(mockStorageStore[CAPTURE_SETTINGS_KEY].iconAction).toBe('full');
      expect(mockStorageStore[CAPTURE_SETTINGS_KEY].downloadFormat).toBe('jpg');
      expect(mockStorageStore[CAPTURE_SETTINGS_KEY].postCaptureAction).toBe('open_editor');
    });
  });

  describe('handleAutoPinSave - FIFO 3 limit buffer', () => {
    it('limits auto-pins to maximum 3 items, evicting the oldest auto-pin', async () => {
      expect(MAX_AUTO_PINS).toBe(3);

      let mockTime = 1000;
      vi.spyOn(Date, 'now').mockImplementation(() => {
        mockTime += 100;
        return mockTime;
      });

      const sendAutoPin = (dataUrl: string) => {
        return new Promise<any>((resolve) => {
          handleAutoPinSave(
            { type: 'SAVE_AUTO_PIN_IMAGE', payload: { dataUrl } },
            resolve,
          );
        });
      };

      const res1 = await sendAutoPin('data:image/png;base64,img1');
      const res2 = await sendAutoPin('data:image/png;base64,img2');
      const res3 = await sendAutoPin('data:image/png;base64,img3');

      expect(res1.success).toBe(true);
      expect(res2.success).toBe(true);
      expect(res3.success).toBe(true);

      let currentPins: PinImage[] = mockStorageStore[PINS_STORAGE_KEY];
      expect(currentPins).toHaveLength(3);
      expect(currentPins.map((p) => p.id)).toEqual([res3.image.id, res2.image.id, res1.image.id]);

      // Adding a 4th auto-pin should evict the oldest auto-pin (res1)
      const res4 = await sendAutoPin('data:image/png;base64,img4');
      expect(res4.success).toBe(true);

      currentPins = mockStorageStore[PINS_STORAGE_KEY];
      expect(currentPins).toHaveLength(3);
      expect(currentPins.map((p) => p.id)).toEqual([res4.image.id, res3.image.id, res2.image.id]);
      expect(currentPins.find((p) => p.id === res1.image.id)).toBeUndefined();
    });
  });
});
