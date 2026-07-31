import { describe, expect, it } from 'vitest';
import { contentSizeFromMetrics } from '../../src/background/captureFullSizeScreenshot';

describe('contentSizeFromMetrics', () => {
  it('prefers cssContentSize and ceils fractional CSS pixels', () => {
    expect(
      contentSizeFromMetrics({
        cssContentSize: { width: 1200.4, height: 3400.2 },
        contentSize: { width: 1, height: 1 },
      }),
    ).toEqual({ width: 1201, height: 3401 });
  });

  it('falls back to contentSize when cssContentSize is missing', () => {
    expect(contentSizeFromMetrics({ contentSize: { width: 800, height: 2000 } })).toEqual({
      width: 800,
      height: 2000,
    });
  });

  it('rejects zero or missing size', () => {
    expect(() => contentSizeFromMetrics({})).toThrow(/measure page size/);
    expect(() => contentSizeFromMetrics({ contentSize: { width: 0, height: 100 } })).toThrow(
      /measure page size/,
    );
  });
});
