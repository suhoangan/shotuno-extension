import { describe, expect, it } from 'vitest';
import {
  GALLERY_RETENTION_MS,
  PIN_RETENTION_MS,
  partitionExpired,
} from '../../src/background/retention';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_700_000_000_000;

const at = (daysAgo: number) => ({ id: `d${daysAgo}`, timestamp: NOW - daysAgo * DAY });

describe('retention windows', () => {
  it('keeps pins for three days and downloads for thirty', () => {
    expect(PIN_RETENTION_MS).toBe(3 * DAY);
    expect(GALLERY_RETENTION_MS).toBe(30 * DAY);
  });
});

describe('partitionExpired', () => {
  it('drops pins older than three days and keeps the rest', () => {
    const { kept, expired } = partitionExpired(
      [at(0), at(2), at(4), at(10)],
      PIN_RETENTION_MS,
      NOW,
    );
    expect(kept.map((p) => p.id)).toEqual(['d0', 'd2']);
    expect(expired.map((p) => p.id)).toEqual(['d4', 'd10']);
  });

  it('keeps an entry sitting exactly on the boundary', () => {
    const { kept, expired } = partitionExpired([at(3)], PIN_RETENTION_MS, NOW);
    expect(kept).toHaveLength(1);
    expect(expired).toHaveLength(0);
  });

  it('applies the longer window to downloads', () => {
    const { kept, expired } = partitionExpired(
      [at(4), at(29), at(31)],
      GALLERY_RETENTION_MS,
      NOW,
    );
    expect(kept.map((p) => p.id)).toEqual(['d4', 'd29']);
    expect(expired.map((p) => p.id)).toEqual(['d31']);
  });

  it('preserves order within each group', () => {
    const { kept } = partitionExpired([at(2), at(0), at(1)], PIN_RETENTION_MS, NOW);
    expect(kept.map((p) => p.id)).toEqual(['d2', 'd0', 'd1']);
  });

  it('handles an empty store', () => {
    expect(partitionExpired([], PIN_RETENTION_MS, NOW)).toEqual({ kept: [], expired: [] });
  });
});
