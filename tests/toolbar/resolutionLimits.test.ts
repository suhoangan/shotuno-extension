import { describe, it, expect } from 'vitest';
import {
  validateResolution,
  isExceedingFreeLimit,
  isExceedingHardCeiling,
  getResolutionTierLabel,
} from '@/content/components/canvas/resolutionLimits';
import {
  RESOLUTION_LIMIT_FREE,
  RESOLUTION_LIMIT_PRO,
  RESOLUTION_HARD_CEILING,
} from '@/store/editorDefaults';

describe('Resolution Limits & Tier Validation', () => {
  describe('Constants sanity', () => {
    it('defines standard Full HD and 4K constants', () => {
      expect(RESOLUTION_LIMIT_FREE.maxWidth).toBe(1920);
      expect(RESOLUTION_LIMIT_FREE.maxHeight).toBe(1080);
      expect(RESOLUTION_LIMIT_PRO.maxWidth).toBe(3840);
      expect(RESOLUTION_LIMIT_PRO.maxHeight).toBe(2160);
      expect(RESOLUTION_HARD_CEILING.maxPixels).toBe(3840 * 2160);
    });
  });

  describe('isExceedingFreeLimit', () => {
    it('returns false for dimensions <= 1920x1080', () => {
      expect(isExceedingFreeLimit(1920, 1080)).toBe(false);
      expect(isExceedingFreeLimit(1280, 720)).toBe(false);
      expect(isExceedingFreeLimit(800, 600)).toBe(false);
    });

    it('returns true for dimensions exceeding Full HD pixel count', () => {
      expect(isExceedingFreeLimit(2560, 1440)).toBe(true);
      expect(isExceedingFreeLimit(3840, 2160)).toBe(true);
    });

    it('handles non-positive dimensions gracefully', () => {
      expect(isExceedingFreeLimit(0, 0)).toBe(false);
      expect(isExceedingFreeLimit(-100, 100)).toBe(false);
    });
  });

  describe('isExceedingHardCeiling', () => {
    it('returns false for dimensions within 4K UHD', () => {
      expect(isExceedingHardCeiling(3840, 2160)).toBe(false);
      expect(isExceedingHardCeiling(1920, 1080)).toBe(false);
    });

    it('returns true for dimensions exceeding 4K UHD or 4096px edge', () => {
      expect(isExceedingHardCeiling(4000, 2500)).toBe(true);
      expect(isExceedingHardCeiling(5120, 2880)).toBe(true);
      expect(isExceedingHardCeiling(4100, 1000)).toBe(true);
    });
  });

  describe('validateResolution', () => {
    it('returns invalid_dimensions for zero or negative values', () => {
      expect(validateResolution(0, 100, false)).toEqual({ status: 'invalid_dimensions' });
      expect(validateResolution(100, -5, true)).toEqual({ status: 'invalid_dimensions' });
    });

    it('permits <= Full HD for Free tier users', () => {
      const result = validateResolution(1920, 1080, false);
      expect(result).toEqual({ status: 'valid' });
    });

    it('flags > Full HD as requires_pro for Free tier users', () => {
      const result = validateResolution(2560, 1440, false);
      expect(result.status).toBe('requires_pro');
      expect(result.messageKey).toBe('resize.requiresPro');
      expect(result.maxAllowedLabel).toBe('Full HD (1080p)');
    });

    it('permits up to 4K for Pro tier users', () => {
      const result = validateResolution(3840, 2160, true);
      expect(result).toEqual({ status: 'valid' });
    });

    it('rejects > 4K for both Free and Pro users with exceeds_max', () => {
      const freeResult = validateResolution(5120, 2880, false);
      expect(freeResult.status).toBe('exceeds_max');
      expect(freeResult.messageKey).toBe('resize.exceedsMax');

      const proResult = validateResolution(5120, 2880, true);
      expect(proResult.status).toBe('exceeds_max');
      expect(proResult.messageKey).toBe('resize.exceedsMax');
    });
  });

  describe('getResolutionTierLabel', () => {
    it('returns appropriate tier labels', () => {
      expect(getResolutionTierLabel(false)).toBe('Full HD (1080p)');
      expect(getResolutionTierLabel(true)).toBe('4K UHD');
    });
  });
});
