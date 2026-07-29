import { describe, expect, it } from 'vitest';
import { blurPixelSize, blurRadiusPx } from '@/content/components/canvas/blurEffect';
import { calloutTextFill } from '@/content/components/canvas/calloutTailLayout';
import { getPaddingFill } from '@/content/components/canvas/borderLayout';
import {
  tiledWatermarkPositions,
  measureWatermarkText,
} from '@/content/components/canvas/tiledWatermark';
import {
  STICKER_GLYPH_RATIO,
  STICKER_MIN_SIZE,
} from '@/content/components/canvas/shapes/stickerLayout';

describe('blurEffect sizing', () => {
  it('derives pixel size and radius from stroke', () => {
    expect(blurPixelSize(12)).toBe(8);
    expect(blurRadiusPx(12)).toBe(8);
    expect(blurPixelSize(0)).toBeGreaterThanOrEqual(2);
  });
});

describe('calloutTextFill', () => {
  it('picks dark text on light backgrounds and white on dark', () => {
    expect(calloutTextFill('#ffffff')).toBe('#000000');
    expect(calloutTextFill('#facc15')).toBe('#000000');
    expect(calloutTextFill('#111111')).toBe('#ffffff');
    expect(calloutTextFill('#ef4444')).toBe('#ffffff');
    expect(calloutTextFill('red')).toBe('#ffffff');
  });
});

describe('getPaddingFill', () => {
  it('returns solid fill for solid presets', () => {
    expect(getPaddingFill('white', 100, 100)).toEqual({ fill: '#ffffff' });
  });

  it('returns gradient props for gradient presets', () => {
    const fill = getPaddingFill('sunset', 200, 100);
    expect(fill).toHaveProperty('fillLinearGradientColorStops');
    expect(fill.fillLinearGradientEndPoint).toEqual({ x: 200, y: 100 });
  });
});

describe('tiledWatermarkPositions', () => {
  it('returns empty for invalid steps', () => {
    expect(tiledWatermarkPositions(100, 100, 0, 10)).toEqual([]);
  });

  it('lays out a staggered grid covering content', () => {
    const positions = tiledWatermarkPositions(100, 80, 50, 40);
    expect(positions.length).toBeGreaterThan(4);
    expect(positions.some((p) => p.x !== 0)).toBe(true);
  });

  it('estimates text size without DOM', () => {
    const m = measureWatermarkText('Shotuno', 18);
    expect(m.width).toBeGreaterThan(40);
    expect(m.height).toBe(18);
  });
});

describe('sticker layout constants', () => {
  it('exposes glyph ratio and min size used by spawn paths', () => {
    expect(STICKER_GLYPH_RATIO).toBe(0.78);
    expect(STICKER_MIN_SIZE).toBe(20);
  });
});

