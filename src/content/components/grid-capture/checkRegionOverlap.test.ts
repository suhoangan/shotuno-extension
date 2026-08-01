import { expect, test, describe } from 'vitest';
import type { Region } from './checkRegionOverlap';
import { checkRegionOverlap } from './checkRegionOverlap';

describe('checkRegionOverlap', () => {
  const regions: Region[] = [
    { id: '1', x: 100, y: 100, w: 100, h: 100 },
    { id: '2', x: 300, y: 100, w: 100, h: 100 }
  ];

  test('returns false when there is no overlap', () => {
    expect(checkRegionOverlap({ x: 0, y: 0, w: 50, h: 50 }, regions)).toBe(false);
    expect(checkRegionOverlap({ x: 250, y: 100, w: 40, h: 100 }, regions)).toBe(false); // between regions
  });

  test('returns true when overlapping partially', () => {
    expect(checkRegionOverlap({ x: 50, y: 50, w: 100, h: 100 }, regions)).toBe(true); // top-left of 1
    expect(checkRegionOverlap({ x: 150, y: 150, w: 100, h: 100 }, regions)).toBe(true); // bottom-right of 1
  });

  test('returns true when completely inside', () => {
    expect(checkRegionOverlap({ x: 120, y: 120, w: 50, h: 50 }, regions)).toBe(true);
  });

  test('returns true when completely encompassing', () => {
    expect(checkRegionOverlap({ x: 50, y: 50, w: 200, h: 200 }, regions)).toBe(true);
  });

  test('returns false when only edges touch', () => {
    expect(checkRegionOverlap({ x: 0, y: 100, w: 100, h: 100 }, regions)).toBe(false); // left edge
    expect(checkRegionOverlap({ x: 200, y: 100, w: 100, h: 100 }, regions)).toBe(false); // right edge
    expect(checkRegionOverlap({ x: 100, y: 0, w: 100, h: 100 }, regions)).toBe(false); // top edge
    expect(checkRegionOverlap({ x: 100, y: 200, w: 100, h: 100 }, regions)).toBe(false); // bottom edge
  });

  test('returns false when only corners touch', () => {
    expect(checkRegionOverlap({ x: 0, y: 0, w: 100, h: 100 }, regions)).toBe(false); // top-left corner
  });

  test('ignores specified region id', () => {
    expect(checkRegionOverlap({ x: 150, y: 150, w: 100, h: 100 }, regions, '1')).toBe(false); // Overlaps 1, but we ignore it
    expect(checkRegionOverlap({ x: 350, y: 150, w: 100, h: 100 }, regions, '1')).toBe(true); // Overlaps 2, ignoring 1 doesnt help
  });
});
