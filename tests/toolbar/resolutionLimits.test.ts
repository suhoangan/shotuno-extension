import { describe, it, expect } from 'vitest';
import {
  validateResolution,
  isExceedingHardCeiling,
  getResolutionTierLabel,
} from '@/content/components/canvas/resolutionLimits';
import {
  RESOLUTION_LIMIT_PRO,
  RESOLUTION_HARD_CEILING,
} from '@/store/editorDefaults';

describe('Resolution Limits Validation', () => {
  describe('Constants sanity', () => {
    it('defines standard 4K constants', () => {
      expect(RESOLUTION_LIMIT_PRO.maxWidth).toBe(3840);
      expect(RESOLUTION_LIMIT_PRO.maxHeight).toBe(2160);
      expect(RESOLUTION_HARD_CEILING.maxPixels).toBe(3840 * 2160);
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
      expect(validateResolution(0, 100)).toEqual({ status: 'invalid_dimensions' });
      expect(validateResolution(100, -5)).toEqual({ status: 'invalid_dimensions' });
    });

    it('permits <= Full HD universally', () => {
      const result = validateResolution(1920, 1080);
      expect(result).toEqual({ status: 'valid' });
    });

    it('permits up to 4K UHD universally with zero paywall gating', () => {
      const result1440p = validateResolution(2560, 1440);
      expect(result1440p).toEqual({ status: 'valid' });

      const result4k = validateResolution(3840, 2160);
      expect(result4k).toEqual({ status: 'valid' });
    });

    it('rejects > 4K with exceeds_max', () => {
      const result = validateResolution(5120, 2880);
      expect(result.status).toBe('exceeds_max');
      expect(result.messageKey).toBe('resize.exceedsMax');
    });
  });

  describe('getResolutionTierLabel', () => {
    it('returns 4K UHD tier label', () => {
      expect(getResolutionTierLabel()).toBe('4K UHD');
    });
  });
});
