import { describe, it, expect, beforeEach } from 'vitest';
import { useEditorStore } from '@/store/useEditorStore';
import {
  ensureImageExt,
  sanitizeBaseName,
  stampedImageName,
  filenameFromUrl,
} from '@/lib/imageNames';

describe('Toolbar & Styling - Actions, Dialogs and Filenames', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  describe('Filename Generation & Sanitization', () => {
    it('ensures image extension defaults to png when none exists', () => {
      expect(ensureImageExt('screenshot')).toBe('screenshot.png');
      expect(ensureImageExt('my-photo.jpg')).toBe('my-photo.jpg');
      expect(ensureImageExt('graphic.webp')).toBe('graphic.webp');
      expect(ensureImageExt('   ')).toBe('image.png');
    });

    it('sanitizes illegal OS filename characters into clean spaces', () => {
      const raw = 'my:special/capture*name?<>|file.png';
      const clean = sanitizeBaseName(raw);
      expect(clean).not.toMatch(/[<>:"/\\|?*]/);
      expect(clean).toBe('my special capture name file');
    });

    it('generates timestamped filenames with proper prefix and date/time components', () => {
      const pinName = stampedImageName('pin');
      const shotName = stampedImageName('shot');
      const dropName = stampedImageName('drop');

      expect(pinName).toMatch(/^Shotuno Pin \d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}-\d{3}\.png$/);
      expect(shotName).toMatch(/^Shotuno Shot \d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}-\d{3}\.png$/);
      expect(dropName).toMatch(/^Shotuno Drop \d{4}-\d{2}-\d{2} \d{2}-\d{2}-\d{2}-\d{3}\.png$/);
    });

    it('extracts sanitized filename from URL with fallback to timestamp on invalid URL', () => {
      const validUrl = 'https://example.com/assets/dashboard-mockup.png';
      expect(filenameFromUrl(validUrl)).toBe('dashboard-mockup.png');

      const genericUrl = 'https://example.com/';
      expect(filenameFromUrl(genericUrl)).toMatch(/^Shotuno Drop \d{4}-\d{2}-\d{2}/);
    });
  });

  describe('Clear All Canvas Action', () => {
    it('clears all shapes and records state in history for undo capability', () => {
      const store = useEditorStore.getState();
      store.addShape({
        id: 's1',
        tool: 'arrow',
        points: [0, 0, 10, 10],
        color: '#f00',
        strokeWidth: 2,
      });
      store.saveHistory();

      // Clear all action
      store.setShapes([]);
      store.saveHistory();

      expect(useEditorStore.getState().shapes).toHaveLength(0);

      // Undo recovers shapes
      store.undo();
      expect(useEditorStore.getState().shapes).toHaveLength(1);
      expect(useEditorStore.getState().shapes[0].id).toBe('s1');
    });
  });
});
