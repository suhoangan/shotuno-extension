import { describe, expect, it } from 'vitest';
import {
  annotationSizeFactor,
  getAnnotationSizeFactor,
  syncAnnotationSizeFactor,
  toImageAnnotationSize,
  toUiAnnotationSize,
} from '@/content/components/canvas/annotationSize';

describe('annotationSize', () => {
  it('scales factor from long edge vs 1280 ref', () => {
    expect(annotationSizeFactor(1280, 720)).toBe(1);
    expect(annotationSizeFactor(2560, 1440)).toBe(2);
    expect(annotationSizeFactor(0, 0)).toBe(1);
    expect(annotationSizeFactor(100, 50)).toBe(0.5); // floor
  });

  it('syncs module factor used by converters', () => {
    syncAnnotationSizeFactor(2560, 1440);
    expect(getAnnotationSizeFactor()).toBe(2);
    expect(toImageAnnotationSize(4)).toBe(8);
    expect(toUiAnnotationSize(8)).toBe(4);
    syncAnnotationSizeFactor(1280, 720);
  });
});

