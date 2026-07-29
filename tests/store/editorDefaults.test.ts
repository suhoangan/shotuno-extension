import { describe, expect, it } from 'vitest';
import {
  BORDER_PADDING_PRESETS,
  DEFAULT_WATERMARK_TEXT,
  STICKER_SIZE,
  calloutTailMetrics,
  defaultToolSettings,
  mergeToolSettings,
  snapBorderPaddingSize,
  snapStrokeWidth,
  textFontSizeFromStrokeWidth,
  textHeightForLines,
  textMinHeight,
} from '@/store/editorDefaults';

const TOOL_IDS = [
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
  'blur',
  'image',
  'crop',
  'counter',
  'callout',
  'magnifier',
  'ocr',
] as const;

describe('defaultToolSettings', () => {
  it('covers every editor tool with sane defaults', () => {
    for (const id of TOOL_IDS) {
      expect(defaultToolSettings[id]).toBeDefined();
      expect(defaultToolSettings[id].strokeWidth).toBeGreaterThan(0);
      expect(defaultToolSettings[id].color).toMatch(/^#/);
    }
  });

  it('uses line style flag only on arrow', () => {
    expect(defaultToolSettings.arrow.isLine).toBe(false);
    expect(defaultToolSettings.rect.isLine).toBeUndefined();
  });

  it('uses larger stroke for highlight/blur/counter', () => {
    expect(defaultToolSettings.highlight.strokeWidth).toBe(8);
    expect(defaultToolSettings.blur.strokeWidth).toBe(8);
    expect(defaultToolSettings.counter.strokeWidth).toBe(12);
    expect(defaultToolSettings.counter.counterStyle).toBe('circle');
  });
});

describe('mergeToolSettings', () => {
  it('clones all defaults when nothing saved', () => {
    const merged = mergeToolSettings();
    expect(Object.keys(merged).sort()).toEqual(Object.keys(defaultToolSettings).sort());
    expect(merged.arrow).not.toBe(defaultToolSettings.arrow);
  });

  it('merges saved prefs and snaps stroke width', () => {
    const merged = mergeToolSettings({
      arrow: { color: '#00ff00', strokeWidth: 10, isLine: true },
      blur: { blurType: 'solid' },
    });
    expect(merged.arrow.color).toBe('#00ff00');
    expect(merged.arrow.strokeWidth).toBe(12); // snapped from 10
    expect(merged.arrow.isLine).toBe(true);
    expect(merged.blur.blurType).toBe('solid');
  });

  it('rejects invalid blurType / counterStyle', () => {
    const merged = mergeToolSettings({
      blur: { blurType: 'nope' as 'blur' },
      counter: { counterStyle: 'hex' as 'circle' },
    });
    expect(merged.blur.blurType).toBe('pixelate');
    expect(merged.counter.counterStyle).toBe('circle');
  });
});

describe('stroke / border / text helpers', () => {
  it('snaps stroke to 4…40 by step 4', () => {
    expect(snapStrokeWidth(1)).toBe(4);
    expect(snapStrokeWidth(6)).toBe(8); // round(6/4)*4
    expect(snapStrokeWidth(10)).toBe(12);
    expect(snapStrokeWidth(99)).toBe(40);
  });

  it('snaps border padding size', () => {
    expect(snapBorderPaddingSize(1)).toBe(8);
    expect(snapBorderPaddingSize(33)).toBe(32);
    expect(snapBorderPaddingSize(200)).toBe(80);
  });

  it('derives text metrics from stroke width', () => {
    expect(textFontSizeFromStrokeWidth(4)).toBe(20);
    expect(textMinHeight(20)).toBe(Math.ceil(20 * 1.2) + 24);
    expect(textHeightForLines(20, 3)).toBeGreaterThan(textMinHeight(20));
  });

  it('scales callout tail with font size', () => {
    const m = calloutTailMetrics(40);
    expect(m.tailWidth).toBeGreaterThan(16);
    expect(m.cornerRadius).toBeGreaterThan(8);
  });

  it('exposes sticker size and watermark default', () => {
    expect(STICKER_SIZE).toBe(110);
    expect(DEFAULT_WATERMARK_TEXT).toContain('Shotuno');
    expect(BORDER_PADDING_PRESETS.map((p) => p.id)).toEqual([
      'sunset',
      'ocean',
      'mint',
      'white',
      'slate',
      'charcoal',
    ]);
  });
});

