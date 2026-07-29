/** UI Size slider values are resolution-independent; convert to image pixels on write. */

/** Reference long-edge (px). Size 12 ≈ 12 image-px on a ~1280px capture. */
export const ANNOTATION_SIZE_REF_LONG_SIDE = 1280;

let currentFactor = 1;

export function annotationSizeFactor(width: number, height: number) {
  const longSide = Math.max(width, height);
  if (!Number.isFinite(longSide) || longSide <= 0) return 1;
  // Floor at 0.5 so tiny captures don't become unusably thin
  return Math.max(0.5, longSide / ANNOTATION_SIZE_REF_LONG_SIDE);
}

/** Keep in sync whenever the editor image / crop content size changes. */
export function syncAnnotationSizeFactor(width: number, height: number) {
  currentFactor = annotationSizeFactor(width, height);
}

export function getAnnotationSizeFactor() {
  return currentFactor;
}

export function toImageAnnotationSize(uiSize: number, factor = currentFactor) {
  return uiSize * factor;
}

export function toUiAnnotationSize(imageSize: number, factor = currentFactor) {
  return factor > 0 ? imageSize / factor : imageSize;
}
