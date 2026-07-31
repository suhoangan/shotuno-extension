import { describe, expect, it } from 'vitest';
import { limitedDimensions, MAX_IMPORT_EDGE } from '../../src/lib/limitImageResolution';

describe('limitedDimensions', () => {
  it('leaves an image that already fits alone', () => {
    expect(limitedDimensions(1920, 1080)).toEqual({ width: 1920, height: 1080, scale: 1 });
  });

  it('brings a 4K capture down to the 2K cap', () => {
    const { width, height } = limitedDimensions(3840, 2160);
    expect(width).toBe(MAX_IMPORT_EDGE);
    expect(height).toBe(1440);
  });

  it('caps a 5K capture by its widest edge', () => {
    expect(limitedDimensions(5120, 2880)).toMatchObject({ width: 2560, height: 1440 });
  });

  it('preserves aspect ratio', () => {
    const { width, height } = limitedDimensions(4000, 3000);
    expect(width / height).toBeCloseTo(4 / 3, 5);
  });

  it('caps a tall full-page capture by width only, never by height', () => {
    // Capping the long edge here would squeeze a 1920px-wide page down to ~246px.
    expect(limitedDimensions(1920, 20000)).toEqual({ width: 1920, height: 20000, scale: 1 });
  });

  it('still narrows a full-page capture that is too wide', () => {
    const { width, height } = limitedDimensions(3840, 20000);
    expect(width).toBe(MAX_IMPORT_EDGE);
    expect(height).toBe(13333);
  });

  it('caps height for portrait images that are not very tall', () => {
    expect(limitedDimensions(2000, 3800)).toMatchObject({ width: 1347, height: 2560 });
  });

  it('treats a degenerate size as a no-op', () => {
    expect(limitedDimensions(0, 0)).toEqual({ width: 0, height: 0, scale: 1 });
  });
});
