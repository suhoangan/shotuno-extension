import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '@/store/useEditorStore';
import {
  DEFAULT_WATERMARK_ENABLED,
  DEFAULT_WATERMARK_TEXT,
  WATERMARK_IMAGE_MAX_WIDTH,
} from '@/store/editorDefaults';

describe('Toolbar & Styling - Watermark Customization', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  describe('Watermark Defaults & Constants', () => {
    it('initializes with watermark disabled by default to prevent accidental export overlays', () => {
      expect(DEFAULT_WATERMARK_ENABLED).toBe(false);
      expect(useEditorStore.getState().watermarkEnabled).toBe(false);
    });

    it('sets a clean default watermark brand text', () => {
      expect(DEFAULT_WATERMARK_TEXT).toBe('© Shotuno');
      expect(useEditorStore.getState().watermarkText).toBe('© Shotuno');
    });

    it('defines maximum constraint for custom watermark image width', () => {
      expect(WATERMARK_IMAGE_MAX_WIDTH).toBe(120);
    });
  });

  describe('Watermark Text & Mode Configuration', () => {
    it('updates watermark custom text and preserves state across tool actions', () => {
      const store = useEditorStore.getState();
      store.setWatermarkText('Confidential Draft');
      store.setWatermarkEnabled(true);

      expect(useEditorStore.getState().watermarkText).toBe('Confidential Draft');
      expect(useEditorStore.getState().watermarkEnabled).toBe(true);
    });

    it('toggles watermark mode between text and image with persistent data url', () => {
      const store = useEditorStore.getState();
      const mockLogoDataUrl = 'data:image/png;base64,mockLogoBase64DataString';

      store.setWatermarkMode('image');
      store.setWatermarkImageUrl(mockLogoDataUrl);
      store.setWatermarkEnabled(true);

      const state = useEditorStore.getState();
      expect(state.watermarkMode).toBe('image');
      expect(state.watermarkImageUrl).toBe(mockLogoDataUrl);
      expect(state.watermarkEnabled).toBe(true);

      // Clear watermark image
      store.setWatermarkImageUrl(null);
      expect(useEditorStore.getState().watermarkImageUrl).toBeNull();
    });
  });
});
