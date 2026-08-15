import { describe, expect, it } from 'vitest';
import {
  defaultToolSettings,
  mergeToolSettings,
  snapStrokeWidth,
  textFontSizeFromStrokeWidth,
  calloutTailMetrics,
  snapBorderPaddingSize,
  BORDER_PADDING_PRESETS,
  DEFAULT_WATERMARK_TEXT,
  DEFAULT_WATERMARK_ENABLED,
} from '@/store/editorDefaults';

describe('Editor Store & All Tools State Verification', () => {
  it('defines valid default settings for all core tools', () => {
    const expectedTools = [
      'select',
      'pan',
      'arrow',
      'measure',
      'rect',
      'circle',
      'triangle',
      'text',
      'brush',
      'highlight',
      'highlight-area',
      'blur',
      'image',
      'crop',
      'counter',
      'callout',
      'magnifier',
      'ocr',
    ];

    expectedTools.forEach((tool) => {
      expect(defaultToolSettings[tool]).toBeDefined();
      expect(defaultToolSettings[tool].color).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(defaultToolSettings[tool].strokeWidth).toBeGreaterThan(0);
    });
  });

  it('snaps stroke widths accurately to valid min/max increments', () => {
    expect(snapStrokeWidth(2)).toBe(4);
    expect(snapStrokeWidth(7)).toBe(8);
    expect(snapStrokeWidth(50)).toBe(40);
  });

  it('calculates font sizes and callout tail metrics proportionally', () => {
    expect(textFontSizeFromStrokeWidth(4)).toBe(20);
    const metrics = calloutTailMetrics(20);
    expect(metrics.tailWidth).toBe(16);
    expect(metrics.cornerRadius).toBe(8);
  });

  it('snaps border padding sizes to step increments', () => {
    expect(snapBorderPaddingSize(5)).toBe(8);
    expect(snapBorderPaddingSize(31)).toBe(32);
    expect(snapBorderPaddingSize(100)).toBe(80);
  });

  it('contains 6 valid window border padding color presets', () => {
    expect(BORDER_PADDING_PRESETS).toHaveLength(6);
    expect(BORDER_PADDING_PRESETS.map((p) => p.id)).toEqual([
      'sunset',
      'ocean',
      'mint',
      'white',
      'slate',
      'charcoal',
    ]);
  });

  it('provides safe default watermark settings', () => {
    expect(DEFAULT_WATERMARK_ENABLED).toBe(false);
    expect(DEFAULT_WATERMARK_TEXT).toBe('© Shotuno');
  });

  it('merges saved tool settings cleanly without throwing', () => {
    const merged = mergeToolSettings({
      rect: { color: '#00ff00', strokeWidth: 16 },
    });
    expect(merged.rect.color).toBe('#00ff00');
    expect(merged.rect.strokeWidth).toBe(16);
    expect(merged.arrow.color).toBe('#ef4444');
  });
});
