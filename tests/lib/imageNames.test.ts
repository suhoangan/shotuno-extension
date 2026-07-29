import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ensureImageExt,
  filenameFromUrl,
  sanitizeBaseName,
  stampedImageName,
} from '@/lib/imageNames';

describe('ensureImageExt', () => {
  it('keeps existing image extensions', () => {
    expect(ensureImageExt('shot.PNG')).toBe('shot.PNG');
    expect(ensureImageExt('a.jpeg')).toBe('a.jpeg');
  });

  it('appends default ext when missing', () => {
    expect(ensureImageExt('shot')).toBe('shot.png');
    expect(ensureImageExt('shot', 'webp')).toBe('shot.webp');
    expect(ensureImageExt('   ')).toBe('image.png');
  });
});

describe('sanitizeBaseName', () => {
  it('strips extension and path junk', () => {
    expect(sanitizeBaseName('my<>file?.png')).toBe('my file');
    expect(sanitizeBaseName('')).toBe('image');
  });

  it('truncates long names', () => {
    expect(sanitizeBaseName('x'.repeat(100)).length).toBe(60);
  });
});

describe('stampedImageName', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('formats pin/drop/shot labels with timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-26T15:34:01.042Z'));
    expect(stampedImageName('pin')).toMatch(
      /^Shotuno Pin 2026-07-26 \d{2}-\d{2}-\d{2}-\d{3}\.png$/,
    );
    expect(stampedImageName('drop')).toContain('Shotuno Drop');
    expect(stampedImageName('shot', 'jpg')).toMatch(/\.jpg$/);
  });
});

describe('filenameFromUrl', () => {
  it('uses sanitized path basename when long enough', () => {
    expect(filenameFromUrl('https://cdn.example.com/photos/sunset.png')).toBe(
      'sunset.png',
    );
  });

  it('falls back to stamped name for short/invalid paths', () => {
    expect(filenameFromUrl('https://cdn.example.com/ab', 'pin')).toMatch(
      /^Shotuno Pin /,
    );
  });
});

