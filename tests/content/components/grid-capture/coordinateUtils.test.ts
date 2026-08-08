import { describe, it, expect, vi, beforeEach } from 'vitest';
import { viewportToDocument, documentToViewport } from '../../../../src/content/components/grid-capture/coordinateUtils';

describe('coordinateUtils', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {
      scrollX: 100,
      scrollY: 200,
    });
  });

  it('converts viewport to document space', () => {
    const rect = { left: 50, top: 150, width: 200, height: 300 };
    const docRect = viewportToDocument(rect);
    
    expect(docRect).toEqual({
      x: 150, // 50 + 100
      y: 350, // 150 + 200
      w: 200,
      h: 300
    });
  });

  it('converts document to viewport space', () => {
    const region = { x: 150, y: 350, w: 200, h: 300 };
    const viewportRect = documentToViewport(region);
    
    expect(viewportRect).toEqual({
      x: 50, // 150 - 100
      y: 150, // 350 - 200
      width: 200,
      height: 300
    });
  });
});
