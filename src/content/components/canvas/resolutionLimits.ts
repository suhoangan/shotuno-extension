import {
  RESOLUTION_HARD_CEILING,
  RESOLUTION_LIMIT_FREE,
  RESOLUTION_LIMIT_PRO,
} from '../../../store/editorDefaults';

export type ResolutionValidationStatus =
  | 'valid'
  | 'requires_pro'
  | 'exceeds_max'
  | 'invalid_dimensions';

export interface ResolutionValidationResult {
  status: ResolutionValidationStatus;
  messageKey?: string;
  maxAllowedLabel?: string;
}

export function isExceedingHardCeiling(width: number, height: number): boolean {
  if (width <= 0 || height <= 0) return false;
  const pixels = width * height;
  return pixels > RESOLUTION_HARD_CEILING.maxPixels || width > 4096 || height > 4096;
}

export function isExceedingFreeLimit(width: number, height: number): boolean {
  if (width <= 0 || height <= 0) return false;
  const pixels = width * height;
  if (pixels > RESOLUTION_LIMIT_FREE.maxPixels) return true;
  // Guard against extreme single-dimension aspect ratios exceeding 1920
  return width > RESOLUTION_LIMIT_FREE.maxWidth && height > RESOLUTION_LIMIT_FREE.maxHeight;
}

export function validateResolution(
  width: number,
  height: number,
  isPro: boolean,
): ResolutionValidationResult {
  if (width <= 0 || height <= 0) {
    return { status: 'invalid_dimensions' };
  }

  if (isExceedingHardCeiling(width, height)) {
    return {
      status: 'exceeds_max',
      messageKey: 'resize.exceedsMax',
      maxAllowedLabel: RESOLUTION_HARD_CEILING.label,
    };
  }

  if (!isPro && isExceedingFreeLimit(width, height)) {
    return {
      status: 'requires_pro',
      messageKey: 'resize.requiresPro',
      maxAllowedLabel: RESOLUTION_LIMIT_FREE.label,
    };
  }

  return { status: 'valid' };
}

export function getResolutionTierLabel(isPro: boolean): string {
  return isPro ? RESOLUTION_LIMIT_PRO.label : RESOLUTION_LIMIT_FREE.label;
}
