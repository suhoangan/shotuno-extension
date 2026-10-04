import {
  RESOLUTION_HARD_CEILING,
  RESOLUTION_LIMIT_PRO,
} from '../../../store/editorDefaults';

export type ResolutionValidationStatus =
  | 'valid'
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

export function validateResolution(
  width: number,
  height: number,
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

  return { status: 'valid' };
}

export function getResolutionTierLabel(): string {
  return RESOLUTION_LIMIT_PRO.label;
}
