import { describe, it, expect } from 'vitest';
import { checkRegionOverlap } from '../../../../src/content/components/grid-capture/checkRegionOverlap';

describe('checkRegionOverlap', () => {
  it('detects overlap when regions intersect', () => {
    const existing = [
      { id: '1', x: 100, y: 100, w: 200, h: 200 }
    ];
    // Overlaps slightly on the bottom right
    const newRect = { x: 250, y: 250, w: 100, h: 100 };
    
    expect(checkRegionOverlap(newRect, existing)).toBe(true);
  });

  it('returns false when regions are far apart (scroll agnostic)', () => {
    const existing = [
      { id: '1', x: 100, y: 100, w: 200, h: 200 }
    ];
    // Far down the page
    const newRect = { x: 100, y: 5000, w: 200, h: 200 };
    
    expect(checkRegionOverlap(newRect, existing)).toBe(false);
  });

  it('detects overlap for regions vertically stacked near same scroll position', () => {
    const existing = [
      { id: '1', x: 100, y: 2000, w: 200, h: 200 }
    ];
    // Overlapping at Y=2100
    const newRect = { x: 100, y: 2100, w: 200, h: 200 };
    
    expect(checkRegionOverlap(newRect, existing)).toBe(true);
  });

  it('ignores the specified id during drag/resize', () => {
    const existing = [
      { id: '1', x: 100, y: 100, w: 200, h: 200 }
    ];
    // Same position but we tell it to ignore '1'
    const newRect = { x: 100, y: 100, w: 200, h: 200 };
    
    expect(checkRegionOverlap(newRect, existing, '1')).toBe(false);
  });
});
