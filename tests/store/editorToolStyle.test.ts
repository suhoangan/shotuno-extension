import { describe, expect, it } from 'vitest';
import { withToolStylePersist } from '@/store/editorToolStyle';
import { defaultToolSettings } from '@/store/editorDefaults';

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

