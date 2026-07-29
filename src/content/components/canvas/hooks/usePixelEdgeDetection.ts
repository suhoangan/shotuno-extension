import { useEffect, useRef, useCallback } from 'react';

const MAX_EDGE_DIM = 1280;

/**
 * Edge detection buffer kept in a ref (not React state) to avoid retaining
 * large ImageData copies across renders. Cleared on unmount / image change.
 */
export function usePixelEdgeDetection(
  image: HTMLImageElement | null,
  bounds?: { x: number; y: number; width: number; height: number }
) {
  const imageDataRef = useRef<ImageData | null>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    imageDataRef.current = null;
    readyRef.current = false;
    if (!image) return;

    let cancelled = false;
    try {
      const scale = Math.min(1, MAX_EDGE_DIM / Math.max(image.width, image.height));
      const w = Math.max(1, Math.floor(image.width * scale));
      const h = Math.max(1, Math.floor(image.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;
      ctx.drawImage(image, 0, 0, w, h);
      if (cancelled) return;
      imageDataRef.current = ctx.getImageData(0, 0, w, h);
      readyRef.current = true;
      // Drop canvas pixels promptly
      canvas.width = 0;
      canvas.height = 0;
    } catch (err) {
      console.warn('Failed to get image data for edge detection:', err);
    }

    return () => {
      cancelled = true;
      imageDataRef.current = null;
      readyRef.current = false;
    };
  }, [image]);

  const findEdges = useCallback((startX: number, startY: number) => {
    const imageData = imageDataRef.current;
    if (!imageData || !image) return null;

    const scaleX = imageData.width / image.width;
    const scaleY = imageData.height / image.height;
    const x = Math.round(startX * scaleX);
    const y = Math.round(startY * scaleY);

    const minX = bounds ? Math.round(bounds.x * scaleX) : 0;
    const minY = bounds ? Math.round(bounds.y * scaleY) : 0;
    const maxX = bounds ? Math.round((bounds.x + bounds.width) * scaleX) - 1 : imageData.width - 1;
    const maxY = bounds ? Math.round((bounds.y + bounds.height) * scaleY) - 1 : imageData.height - 1;

    if (x < minX || x > maxX || y < minY || y > maxY) return null;

    const { width, data } = imageData;
    const getPixel = (px: number, py: number) => {
      const i = (py * width + px) * 4;
      return [data[i], data[i + 1], data[i + 2], data[i + 3]];
    };
    const baseColor = getPixel(x, y);
    const colorDiff = (c1: number[], c2: number[]) =>
      Math.sqrt(
        (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2,
      );

    const THRESHOLD = 30;
    const MAX_SCAN = 800;
    
    let top = y;
    let hitTop = false;
    while (top > minY && y - top < MAX_SCAN) {
      if (colorDiff(baseColor, getPixel(x, top - 1)) >= THRESHOLD) {
        hitTop = true;
        break;
      }
      top--;
    }
    if (top <= minY) hitTop = true;

    let bottom = y;
    let hitBottom = false;
    while (bottom < maxY && bottom - y < MAX_SCAN) {
      if (colorDiff(baseColor, getPixel(x, bottom + 1)) >= THRESHOLD) {
        hitBottom = true;
        break;
      }
      bottom++;
    }
    if (bottom >= maxY) hitBottom = true;

    let left = x;
    let hitLeft = false;
    while (left > minX && x - left < MAX_SCAN) {
      if (colorDiff(baseColor, getPixel(left - 1, y)) >= THRESHOLD) {
        hitLeft = true;
        break;
      }
      left--;
    }
    if (left <= minX) hitLeft = true;

    let right = x;
    let hitRight = false;
    while (right < maxX && right - x < MAX_SCAN) {
      if (colorDiff(baseColor, getPixel(right + 1, y)) >= THRESHOLD) {
        hitRight = true;
        break;
      }
      right++;
    }
    if (right >= maxX) hitRight = true;

    return {
      top: top / scaleY,
      bottom: bottom / scaleY,
      left: left / scaleX,
      right: right / scaleX,
      centerX: startX,
      centerY: startY,
      hasVertical: hitTop || hitBottom,
      hasHorizontal: hitLeft || hitRight,
    };
  }, [image, bounds]);

  return { findEdges, isReady: readyRef.current };
}
