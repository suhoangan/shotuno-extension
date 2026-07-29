import { describe, expect, it } from 'vitest';
import {
  buildSmartMeasureShape,
  canMeasureHeight,
  canMeasureWidth,
  pickSmartMeasureAxis,
  type SmartMeasureBounds,
} from '@/content/components/canvas/measureTool';

const full: SmartMeasureBounds = {
  top: 10,
  bottom: 110,
  left: 20,
  right: 220,
  centerX: 120,
  centerY: 60,
  hasVertical: true,
  hasHorizontal: true,
};

describe('measureTool', () => {
  it('requires span > 2px and axis flags', () => {
    expect(canMeasureHeight(full)).toBe(true);
    expect(canMeasureWidth(full)).toBe(true);
    expect(canMeasureHeight({ ...full, hasVertical: false })).toBe(false);
    expect(canMeasureWidth({ ...full, right: full.left + 1 })).toBe(false);
  });

  it('picks height near top/bottom, width near left/right', () => {
    expect(pickSmartMeasureAxis({ x: 120, y: 12 }, full)).toBe('height');
    expect(pickSmartMeasureAxis({ x: 22, y: 60 }, full)).toBe('width');
  });

  it('builds measure shapes for each axis', () => {
    const height = buildSmartMeasureShape({ x: 50, y: 12 }, full, '#f00', 4);
    expect(height?.type).toBe('measure');
    expect(height?.points).toEqual([50, 10, 50, 110]);

    const width = buildSmartMeasureShape({ x: 22, y: 80 }, full, '#0f0', 8);
    expect(width?.points).toEqual([20, 80, 220, 80]);
    expect(width?.strokeWidth).toBe(8);
  });

  it('returns null when neither axis is measurable', () => {
    expect(
      buildSmartMeasureShape(
        { x: 0, y: 0 },
        { ...full, hasVertical: false, hasHorizontal: false },
        '#000',
        4,
      ),
    ).toBeNull();
  });
});

