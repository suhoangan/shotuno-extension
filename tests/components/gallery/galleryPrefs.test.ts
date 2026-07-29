import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GALLERY_UI_PREFS,
  filterGalleryByDate,
  formatGalleryDate,
  loadGalleryUiPrefs,
} from '@/components/gallery/galleryPrefs';
import { defaultToolSettings } from '@/store/editorDefaults';
import { withToolStylePersist } from '@/store/editorToolStyle';

describe('galleryPrefs', () => {
  it('returns defaults without chrome.storage', async () => {
    await expect(loadGalleryUiPrefs()).resolves.toEqual(DEFAULT_GALLERY_UI_PREFS);
  });

  it('filters by today and week', () => {
    const now = Date.now();
    const images = [
      { id: 'today', timestamp: now },
      { id: 'old', timestamp: now - 10 * 24 * 60 * 60 * 1000 },
    ];
    expect(filterGalleryByDate(images, 'all')).toHaveLength(2);
    expect(filterGalleryByDate(images, 'today').map((i) => i.id)).toEqual(['today']);
    expect(filterGalleryByDate(images, 'week').map((i) => i.id)).toEqual(['today']);
  });

  it('formats a readable date string', () => {
    expect(formatGalleryDate(Date.parse('2026-07-26T12:00:00Z'))).toMatch(/\w+/);
  });
});

describe('withToolStylePersist', () => {
  it('merges patch into active tool settings when persist enabled', () => {
    const state = {
      activeTool: 'arrow',
      toolSettings: {
        arrow: { ...defaultToolSettings.arrow },
        rect: { ...defaultToolSettings.rect },
      },
    };
    const next = withToolStylePersist(
      state,
      { color: '#111111' },
      { color: '#111111', isLine: true },
    );
    expect(next.color).toBe('#111111');
    expect(next.toolSettings?.arrow.color).toBe('#111111');
    expect(next.toolSettings?.arrow.isLine).toBe(true);
  });

  it('skips toolSettings when persist disabled', () => {
    const state = {
      activeTool: 'rect',
      toolSettings: {
        arrow: { ...defaultToolSettings.arrow },
        rect: { ...defaultToolSettings.rect },
      },
    };
    const next = withToolStylePersist(
      state,
      { color: '#222222' },
      { color: '#222222' },
      false,
    );
    expect(next).toEqual({ color: '#222222' });
  });
});

