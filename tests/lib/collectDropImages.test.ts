import { describe, expect, it } from 'vitest';
import { SHOTUNO_DRAG_MIME } from '@/lib/shotunoDrag';
import {
  MAX_IMAGES_PER_DROP,
  collectDropImages,
  dropHasImages,
  isShotunoLibraryDrag,
} from '@/lib/collectDropImages';

function dt(partial: {
  types?: string[];
  files?: File[];
  data?: Record<string, string>;
}): DataTransfer {
  const data = partial.data ?? {};
  return {
    types: partial.types ?? Object.keys(data),
    files: partial.files ?? ([] as unknown as FileList),
    getData: (type: string) => data[type] ?? '',
  } as unknown as DataTransfer;
}

describe('isShotunoLibraryDrag', () => {
  it('detects custom MIME in types during dragover', () => {
    expect(isShotunoLibraryDrag(dt({ types: [SHOTUNO_DRAG_MIME] }))).toBe(true);
  });

  it('detects shotuno: plain payload on drop', () => {
    expect(
      isShotunoLibraryDrag(dt({ data: { 'text/plain': 'shotuno:gallery:abc' } })),
    ).toBe(true);
  });

  it('does not treat bare words as library drag', () => {
    expect(isShotunoLibraryDrag(dt({ data: { 'text/plain': 'hello-world' } }))).toBe(
      false,
    );
  });
});

describe('collectDropImages', () => {
  it('ignores Shotuno library drags', () => {
    expect(collectDropImages(dt({ types: [SHOTUNO_DRAG_MIME] }))).toEqual({
      files: [],
      urls: [],
    });
  });

  it('prefers image files over URLs and caps count', () => {
    const files = Array.from({ length: MAX_IMAGES_PER_DROP + 2 }, (_, i) =>
      new File([`x${i}`], `a${i}.png`, { type: 'image/png' }),
    );
    const result = collectDropImages(
      dt({
        files,
        data: { 'text/uri-list': 'https://cdn.example.com/pic.png' },
      }),
    );
    expect(result.files).toHaveLength(MAX_IMAGES_PER_DROP);
    expect(result.urls).toEqual([]);
  });

  it('collects image URLs from uri-list and prefers higher-res path', () => {
    const result = collectDropImages(
      dt({
        data: {
          'text/uri-list':
            'https://i.pinimg.com/236x/ab/cd.jpg\nhttps://i.pinimg.com/originals/ab/cd.jpg',
        },
      }),
    );
    expect(result.urls[0]).toContain('/originals/');
  });

  it('extracts img src from HTML', () => {
    const result = collectDropImages(
      dt({
        data: {
          'text/html': '<img src="https://cdn.example.com/images/photo.webp" />',
        },
      }),
    );
    expect(result.urls).toEqual(['https://cdn.example.com/images/photo.webp']);
  });
});

describe('dropHasImages', () => {
  it('is false for library drags', () => {
    expect(dropHasImages(dt({ types: [SHOTUNO_DRAG_MIME] }))).toBe(false);
  });

  it('is true for Files / uri-list / html types', () => {
    expect(dropHasImages(dt({ types: ['Files'] }))).toBe(true);
    expect(dropHasImages(dt({ types: ['text/uri-list'] }))).toBe(true);
    expect(dropHasImages(dt({ types: ['text/html'] }))).toBe(true);
  });
});

