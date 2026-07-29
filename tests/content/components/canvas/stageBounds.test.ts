import { describe, expect, it } from 'vitest';
import { getContentRect, getStageBounds } from '@/content/components/canvas/stageBounds';

const image = { width: 1000, height: 600 };
const crop = { x: 100, y: 50, width: 400, height: 300 };

const borderOff = {
  borderEnabled: false,
  borderStyle: 'none' as const,
  borderPadding: false,
  borderPaddingSize: 30,
  includeUrl: false,
  urlPosition: 'top' as const,
};

describe('getContentRect', () => {
  it('uses full image while cropping', () => {
    expect(getContentRect(image, crop, 'crop')).toEqual({
      x: 0,
      y: 0,
      width: 1000,
      height: 600,
    });
  });

  it('uses crop when set and not in crop tool', () => {
    expect(getContentRect(image, crop, 'arrow')).toEqual(crop);
  });

  it('falls back to full image without crop', () => {
    expect(getContentRect(image, null, 'select')).toEqual({
      x: 0,
      y: 0,
      width: 1000,
      height: 600,
    });
  });
});

describe('getStageBounds', () => {
  it('matches content when border disabled', () => {
    const bounds = getStageBounds(image, null, 'select', borderOff);
    expect(bounds).toMatchObject({
      x: 0,
      y: 0,
      width: 1000,
      height: 600,
      content: { x: 0, y: 0, width: 1000, height: 600 },
    });
  });

  it('expands for padding + macos header', () => {
    // 30 snaps to 32 via snapBorderPaddingSize
    const pad = 32;
    const bounds = getStageBounds(image, null, 'select', {
      borderEnabled: true,
      borderStyle: 'macos',
      borderPadding: true,
      borderPaddingSize: 30,
      includeUrl: false,
      urlPosition: 'top',
    });
    expect(bounds.x).toBe(-pad);
    expect(bounds.y).toBe(-pad - 48);
    expect(bounds.width).toBe(1000 + pad * 2);
    expect(bounds.height).toBe(600 + pad * 2 + 48);
  });

  it('adds footer when url is at bottom', () => {
    const bounds = getStageBounds(image, null, 'select', {
      borderEnabled: true,
      borderStyle: 'windows',
      borderPadding: false,
      borderPaddingSize: 30,
      includeUrl: true,
      urlPosition: 'bottom',
    });
    expect(bounds.height).toBe(600 + 48 + 40);
  });
});

